import os
import time
from dotenv import load_dotenv
from pinecone import Pinecone
from huggingface_hub import InferenceClient
from Tools.logger import log_agent_start, log_llm_call, log_tool_call

load_dotenv()

class IndianStockRAGEngine:
    def __init__(self):
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.index_host = os.getenv("PINECONE_INDEX_HOST")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "indian-stock-education")
        self.hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
        self.hf_model = os.getenv("HF_CHAT_MODEL", "meta-llama/Llama-3.1-8B-Instruct")

        self.index = None
        if self.pinecone_api_key and "placeholder" not in self.pinecone_api_key:
            try:
                pc = Pinecone(api_key=self.pinecone_api_key)
                self.index = pc.Index(host=self.index_host) if self.index_host else pc.Index(self.index_name)
                print(" Connected to Pinecone index.")
            except Exception as e:
                print(f"[ERROR] Pinecone Connection Failed: {e}")

        self.hf_client = None
        if self.hf_token and "placeholder" not in self.hf_token:
            try:
                self.hf_client = InferenceClient(api_key=self.hf_token, provider="auto")
                print(f" Connected to Hugging Face LLM ({self.hf_model}).")
            except Exception as e:
                print(f"[ERROR] Hugging Face Client Init Failed: {e}")

    def semantic_search(self, query: str, top_k: int = 3) -> str:
        t0 = time.time()
        contexts = []
        if self.index:
            try:
                search_res = self.index.search_records(
                    namespace="stock-education",
                    query={"inputs": {"text": query}, "top_k": top_k},
                    fields=["text", "source", "chunk_id"]
                )
                hits = getattr(search_res.result, "hits", []) if hasattr(search_res, "result") else search_res.get("result", {}).get("hits", [])
                for hit in hits:
                    fields = getattr(hit, "fields", None) or (hit.get("fields") if isinstance(hit, dict) else {})
                    txt = fields.get("text", "")
                    if txt:
                        contexts.append(txt)
            except Exception as e:
                print(f"[ERROR] Pinecone search error: {e}")

        log_tool_call(
            tool_name="Pinecone Vector Retrieval (llama-text-embed-v2)",
            inputs={"query": query, "top_k": top_k, "namespace": "stock-education"},
            output_summary=f"Retrieved {len(contexts)} chunks",
            duration=time.time() - t0
        )
        return "\n\n---\n\n".join(contexts) if contexts else "General SEBI and Indian stock market principles."

    def ask(self, query: str) -> str:
        log_agent_start("NiveshGuru RAG Chatbot Agent", f"Process user education query: '{query}'")

        # Step 1: Semantic Search
        context = self.semantic_search(query)

        # Step 2: Prepare Prompting
        system_prompt = (
            "You are 'NiveshGuru', an institutional Indian stock market mentor (NSE/BSE). "
            "Explain concepts accurately, professionally, and conversationally with practical examples. "
            "Never quote raw chunks or say 'according to context'. Give clean direct answers."
        )
        user_prompt = f"Reference Context:\n{context}\n\nInvestor Query: {query}\n\nExplanation:"

        # Step 3: LLM Inference
        llm_start = time.time()
        final_answer = ""
        candidate_models = [self.hf_model, "HuggingFaceH4/zephyr-7b-beta"]

        if self.hf_client:
            for model_id in candidate_models:
                try:
                    resp = self.hf_client.chat.completions.create(
                        model=model_id,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        max_tokens=450,
                        temperature=0.3
                    )
                    final_answer = resp.choices[0].message.content.strip()
                    if final_answer:
                        log_llm_call(
                            agent_name="NiveshGuru RAG Chatbot",
                            model_name=model_id,
                            system_prompt=system_prompt,
                            user_prompt=user_prompt,
                            output_text=final_answer,
                            latency=time.time() - llm_start,
                            provider="Hugging Face Serverless"
                        )
                        break
                except Exception as err:
                    print(f"  [WARN] Model {model_id} failed: {err}")

        if not final_answer:
            if "beta" in query.lower():
                final_answer = (
                    "Beta measures how volatile a stock is compared to the broader market (like the Nifty 50 or Sensex):\n\n"
                    "• Beta = 1.0: Moves in lockstep with the benchmark index.\n"
                    "• Beta > 1.0: High volatility (amplifies both market upswings and drawdowns).\n"
                    "• Beta < 1.0: Defensive stock (exhibits lower price swings, common in FMCG and Pharma)."
                )
            elif "pe" in query.lower() or "p/e" in query.lower():
                final_answer = (
                    "The Price-to-Earnings (P/E) ratio compares a company's share price to its per-share earnings (EPS).\n\n"
                    "• High P/E: Indicates strong growth expectations or a premium valuation.\n"
                    "• Low P/E: Indicates potential undervaluation or cyclical performance.\n"
                    "• Always compare P/E against the respective industry sector benchmark."
                )
            else:
                final_answer = "For sustainable capital compounding in Indian markets, maintain asset diversification across large and mid-caps with a disciplined 3-7 year horizon."

            log_llm_call(
                agent_name="NiveshGuru RAG Chatbot (Static Rule Engine)",
                model_name="Expert Financial Rules",
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                output_text=final_answer,
                latency=time.time() - llm_start,
                provider="Deterministic Fallback"
            )

        return final_answer

rag_service = IndianStockRAGEngine()