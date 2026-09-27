import os
from dotenv import load_dotenv
from pinecone import Pinecone
from RAG.chunking import load_documents_from_folder, split_documents

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_HOST = os.getenv("PINECONE_INDEX_HOST")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "indian-stock-education")

def index_documents():
    if not PINECONE_API_KEY or "placeholder" in PINECONE_API_KEY:
        raise ValueError("Please provide a valid PINECONE_API_KEY in your .env file.")

    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Connect directly using the integrated host or index name
    if INDEX_HOST:
        index = pc.Index(host=INDEX_HOST)
    else:
        index = pc.Index(INDEX_NAME)

    raw_docs = load_documents_from_folder("RAG/documents")
    if not raw_docs:
        print("No documents found in RAG/documents/. Ingestion skipped.")
        return

    # Chunking: 700 chars with 120 overlap preserves financial metrics
    chunks = split_documents(raw_docs, chunk_size=700, chunk_overlap=120)
    print(f"Ingesting {len(chunks)} chunks into Pinecone using llama-text-embed-v2...")

    records = []
    for i, chunk in enumerate(chunks):
        source = os.path.basename(chunk.metadata.get("source", "doc"))
        record = {
            "_id": f"chunk_{i}_{source}".replace(" ", "_"),
            "text": chunk.page_content,
            "source": source,
            "chunk_id": i
        }
        records.append(record)

        # Batch upsert in sets of 50
        if len(records) >= 50:
            index.upsert_records(namespace="stock-education", records=records)
            records = []

    if records:
        index.upsert_records(namespace="stock-education", records=records)

    print("✅ Ingestion complete! Check your Pinecone console — record count will update.")

if __name__ == "__main__":
    index_documents()