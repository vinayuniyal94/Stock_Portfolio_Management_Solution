import os
import time
from dotenv import load_dotenv
from pinecone import Pinecone
from Tools.logger import log_agent_start, log_tool_call
from Tools.llm_tool import query_llm_with_fallback
from Prompts.prompt_templates import (
    RAG_CHATBOT_SYSTEM_PROMPT,
    get_rag_chatbot_user_prompt
)

load_dotenv()

class IndianStockRAGEngine:
    def __init__(self):
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.index_host = os.getenv("PINECONE_INDEX_HOST")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "indian-stock-education")

        self.index = None
        if self.pinecone_api_key and "placeholder" not in self.pinecone_api_key:
            try:
                pc = Pinecone(api_key=self.pinecone_api_key)
                self.index = pc.Index(host=self.index_host) if self.index_host else pc.Index(self.index_name)
            except Exception as e:
                print(f"[ERROR] Pinecone Connection Failed: {e}")

    def semantic_search_with_observability(self, query: str, top_k: int = 4):
        t0 = time.time()
        contexts = []
        detailed_chunks = []

        print("\n" + "=" * 100)
        print("  [PINECONE SEMANTIC SEARCH RETRIEVAL - TOP-K OBSERVABILITY]")
        print(f"  • Query: \"{query}\"")
        print(f"  • Top-K Requested: {top_k}")
        print("=" * 100)

        if self.index:
            try:
                search_res = self.index.search_records(
                    namespace="stock-education",
                    query={"inputs": {"text": query}, "top_k": top_k},
                    fields=["text", "source", "chunk_id"]
                )

                hits = (
                    getattr(search_res.result, "hits", [])
                    if hasattr(search_res, "result")
                    else search_res.get("result", {}).get("hits", [])
                )

                for idx, hit in enumerate(hits, 1):
                    fields = getattr(hit, "fields", None) or (hit.get("fields") if isinstance(hit, dict) else {})
                    score = getattr(hit, "score", None) or (hit.get("_score") if isinstance(hit, dict) else 0.0)
                    chunk_id = getattr(hit, "_id", None) or hit.get("_id") or fields.get("chunk_id", f"chk_{idx}")
                    src = fields.get("source", "knowledge_base")
                    raw_text = fields.get("text", "")

                    if raw_text:
                        char_count = len(raw_text)
                        word_count = len(raw_text.split())

                        contexts.append(raw_text)
                        detailed_chunks.append({
                            "rank": idx,
                            "chunk_id": chunk_id,
                            "char_size": char_count,
                            "word_size": word_count,
                            "score": round(float(score), 4) if isinstance(score, (int, float)) else score,
                            "source": src,
                            "text": raw_text
                        })
            except Exception as e:
                print(f"  [ERROR] Pinecone search error: {e}")

        duration = time.time() - t0

        print(f"\n--- [PINECONE RETRIEVED {len(detailed_chunks)} CHUNKS in {duration:.3f}s] ---")
        print(f"{'Rank':<6}{'Chunk ID':<25}{'Score':<10}{'Char Size':<12}{'Word Size':<12}{'Source'}")
        print("-" * 80)
        for c in detailed_chunks:
            print(f"#{c['rank']:<5}{str(c['chunk_id']):<25}{c['score']:<10}{c['char_size']:<12}{c['word_size']:<12}{c['source']}")
            print(f"Preview: {c['text'][:140].strip()}...\n")

        chunk_summaries = [f"{c['chunk_id']} ({c['char_size']} chars)" for c in detailed_chunks]

        log_tool_call(
            tool_name="Pinecone Vector Search",
            inputs={"query": query, "top_k": top_k},
            output_summary=f"Retrieved {len(detailed_chunks)} chunks: {chunk_summaries}",
            duration=duration
        )

        combined_context = "\n\n---\n\n".join(contexts) if contexts else "Standard SEBI and Indian stock market educational guidelines."
        return combined_context, detailed_chunks

    def ask(self, query: str) -> str:
        log_agent_start("NiveshGuru RAG Chatbot Agent", f"Process user query: '{query}'")

        combined_context, chunks = self.semantic_search_with_observability(query, top_k=4)

        system_prompt = RAG_CHATBOT_SYSTEM_PROMPT
        user_prompt = get_rag_chatbot_user_prompt(query, combined_context)

        answer = query_llm_with_fallback(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            agent_name="NiveshGuru RAG Chatbot",
            temperature=0.3,
            max_tokens=600
        )

        if not answer:
            answer = (
                "Beta measures equity volatility relative to the benchmark Nifty 50 index. "
                "A Beta > 1 signifies higher volatility than the index, while Beta < 1 indicates defensive characteristics."
            )

        return answer

# Singleton Export
rag_service = IndianStockRAGEngine()
rag_engine = rag_service