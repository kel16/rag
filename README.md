# RAG on local documents

## Structure

1. **Extract** text from each PDF using `pypdf`
2. **Chunk** the text into 800-character pieces with 100 overlap, tagged with which document they came from
3. **Embed** each chunk locally using `sentence-transformers`
   (`all-MiniLM-L6-v2`)
4. **Store** the embeddings in a **ChromaDB** collection locally
5. On question send:
   - The question is embedded the same way
   - Vector DB finds the most similar chunks across *all* loaded documents
6. **Generate**: send those chunks + your question to an LLM via **LiteLLM**, asking it to answer using only that context
7. Return the answer, the source passages (with which document each came from), and per-stage latency

## Setup

### 1. Run Ollama locally
To pull the model:
```bash
ollama pull phi3
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Put your PDFs to /documents

### Backend

```bash
export DOCS_PATH="path/to/pdf_folder"
uvicorn api:app --reload
```

Open **http://127.0.0.1:8000/docs** - Swagger from the Pydantic models.

Endpoints:

- `GET /health` - confirms the pipeline is loaded, chunk count, and
  which documents were indexed
- `POST /query` - send `{"question": "...", "top_k": 3}`, get back
  `{"question", "answer", "sources": [{"text", "source"}, ...], "timings_ms"}`

### Frontend

```bash
cd frontend
npm i
npm run dev
```
