import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.pipeline import RAGPipeline
from app.schemas import HealthResponse, QueryRequest, QueryResponse

logger = logging.getLogger("rag")
logging.basicConfig(level=logging.INFO)

pipeline_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    docs_path = os.environ.get("DOCS_PATH", "./documents")
    logger.info("Loading and embedding documents from: %s", docs_path)

    try:
        pipeline_state["pipeline"] = await asyncio.to_thread(RAGPipeline, docs_path)
        logger.info("Ready.")
    except Exception:
        logger.exception("Failed to build the RAG pipeline at startup")
        pipeline_state["pipeline"] = None

    yield
    pipeline_state.clear()


app = FastAPI(
    title="RAG",
    description="Ask questions about PDFs, grounded via retrieval-augmented generation.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    pipeline = pipeline_state.get("pipeline")

    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not loaded yet.")

    return HealthResponse(
        status="ok",
        chunks_loaded=len(pipeline.chunks),
        documents=pipeline.document_names,
    )


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    pipeline = pipeline_state.get("pipeline")

    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not loaded yet.")

    try:
        result = await asyncio.to_thread(pipeline.query, request.question, request.top_k)
    except RuntimeError as exc:
        logger.exception("Query failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return QueryResponse(
        question=request.question,
        answer=result["answer"],
        sources=result["sources"],
        timings_ms=result["timings_ms"],
    )
