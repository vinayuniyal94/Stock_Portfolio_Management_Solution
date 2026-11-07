# ArthVeda AI — Institutional Wealth Management & Multi-Agent Portfolio Suite

ArthVeda AI is a production-grade, multi-agent financial advisory platform designed for Indian retail and institutional investors. It combines a LangGraph-orchestrated multi-agent pipeline, a RAG-powered educational knowledge base, direct NSE exchange data feeds, and Supabase Row Level Security (RLS) authentication.

---

## 🏗️ Architecture & Multi-Agent Suite

The platform orchestrates autonomous financial agents governed by a Chief Risk Officer (CRO) Critique audit loop:

1. **Risk Profiler Agent**: Analyzes user intake profiles (age, income slab, horizon, capital) using ReAct reasoning to compute behavioral risk capacity, scores (0–100), and risk categories.
2. **Sector Analysis Agent**: Dynamically discovers macro-aligned sectors and pulls verified live NSE equities with zero cross-contamination.
3. **Stock Bucket Agent**: Curates risk-adjusted portfolio baskets with dynamic asset sizing and institutional research theses.
4. **Critique Agent (CRO)**: Audits outputs from upstream agents across functional boundaries, validating PII compliance and sector-stock isolation before granting approval.
5. **NiveshGuru RAG Chatbot**: Powered by Pinecone vector search with top-$K$ semantic observability and OpenAI/Hugging Face generation, answering investor queries on SEBI guidelines, P/E ratios, and market fundamentals.

---

## 🛠️ Tech Stack

* **Frontend**: React, Tailwind CSS, Lucide Icons
* **Backend**: FastAPI (Python), LangGraph, LangChain, OpenAI (`gpt-4o-mini`)
* **Database & Auth**: Supabase PostgreSQL with RLS and local storage fallback staging
* **Vector Database**: Pinecone (`indian-stock-education` index)
* **Market Data**: Direct NSE API integration and live metric endpoints

---

## 🚀 Getting Started & Installation

### 1. Clone the Repository & Configure Environment
Create a `.env` file in your root directory:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Pinecone RAG Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=indian-stock-education
PINECONE_INDEX_HOST=your_pinecone_index_host

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_key

# Server Port
PORT=8000