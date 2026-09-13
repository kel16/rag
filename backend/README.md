## Backend

### Backend Endpoints

#### `GET /health`

Returns the current indexing/pipeline status, including:

- whether the pipeline is loaded,
- the number of indexed chunks,
- and the documents that have been indexed.

#### `POST /query`

Submit a question:

```json
{
  "question": "What is this document about?",
  "top_k": 3
}
```

The response contains:

```json
{
  "question": "...",
  "answer": "...",
  "sources": [
    {
      "text": "...",
      "source": "document.pdf"
    }
  ],
  "timings_ms": {
    "embedding": 0,
    "retrieval": 0,
    "generation": 0
  }
}
```

### Code Quality

Run Ruff:

```bash
cd backend
uv run ruff check .
```

Check formatting:

```bash
uv run ruff format --check .
```

Automatically format:

```bash
uv run ruff format .
```
