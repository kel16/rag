import os
import time
import uuid
from typing import TypedDict

import chromadb
from sentence_transformers import SentenceTransformer

from app.config import settings
from app.core.chunking import chunk_text
from app.core.llm import ask_llm
from app.core.pdf import extract_text_from_pdf, resolve_pdf_paths
from app.schemas import SourceChunk


class QueryResult(TypedDict):
    answer: str
    sources: list[SourceChunk]
    timings_ms: dict[str, float]


class RAGPipeline:
    """
    Loads one or more PDFs, embeds their chunks into a ChromaDB collection,
    and answers questions against the combined set.
    """

    def __init__(
        self,
        source: str | list[str],
        default_top_k: int | None = None,
        persist_dir: str | None = None,
        collection_name: str | None = None,
    ):
        self.default_top_k = default_top_k if default_top_k is not None else settings.default_top_k
        persist_dir = persist_dir or settings.persist_dir
        collection_name = collection_name or settings.collection_name

        self.embed_model = SentenceTransformer(settings.embedding_model)

        pdf_paths = resolve_pdf_paths(source)
        self.document_names = [os.path.basename(p) for p in pdf_paths]

        # Fresh collection each run.
        client = chromadb.PersistentClient(path=persist_dir)
        try:
            client.delete_collection(collection_name)
        except Exception:
            pass

        self.collection = client.create_collection(collection_name)

        all_chunks: list[str] = []
        all_metadatas: list[dict[str, str | int]] = []
        all_ids: list[str] = []

        for pdf_path in pdf_paths:
            try:
                text = extract_text_from_pdf(pdf_path)
            except Exception as exc:
                # Don't let one corrupt/unreadable PDF take down the whole
                # index; skip it and keep going with the rest.
                print(f"Skipping {pdf_path}: failed to extract text ({exc})")
                continue

            doc_chunks = chunk_text(
                text,
                chunk_size=settings.chunk_size,
                overlap=settings.chunk_overlap,
            )
            doc_name = os.path.basename(pdf_path)

            if not doc_chunks:
                print(f"Skipping {pdf_path}: no extractable text (scanned/image-only PDF?)")
                continue

            for i, chunk in enumerate(doc_chunks):
                all_chunks.append(chunk)
                all_metadatas.append({"source": doc_name, "chunk_index": i})
                all_ids.append(str(uuid.uuid4()))

        if not all_chunks:
            raise ValueError(
                "No text could be extracted from the given PDF(s). "
                "Check that the files exist and are not scanned/image-only."
            )

        self.chunks = all_chunks

        try:
            embeddings = self.embed_model.encode(
                all_chunks, convert_to_numpy=True, show_progress_bar=True
            ).tolist()
        except Exception as exc:
            raise RuntimeError(f"Failed to embed document chunks: {exc}") from exc

        self.collection.add(
            ids=all_ids,
            embeddings=embeddings,
            documents=all_chunks,
            metadatas=all_metadatas,
        )

    def retrieve(self, question: str, top_k: int | None = None) -> list[SourceChunk]:
        """
        top_k is passed in per-call (not read from self) so concurrent
        requests with different top_k values never interfere with each
        other.
        """
        k = top_k if top_k is not None else self.default_top_k

        try:
            question_embedding = self.embed_model.encode([question], convert_to_numpy=True).tolist()
            results = self.collection.query(
                query_embeddings=question_embedding,
                n_results=k,
            )
        except Exception as exc:
            raise RuntimeError(f"Retrieval failed: {exc}") from exc

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]

        return [
            SourceChunk(text=doc, source=str(meta["source"]))
            for doc, meta in zip(documents, metadatas)
        ]

    def query(self, question: str, top_k: int | None = None) -> QueryResult:
        """
        Answer a question and report per-stage latency (ms). Timing each
        stage separately is what lets you find the actual bottleneck
        instead of only knowing the total request time.

        Raises RuntimeError if retrieval or generation fails, so the API
        layer can turn that into a clean HTTP error instead of a 500 with
        a raw stack trace.
        """
        t0 = time.perf_counter()
        sources = self.retrieve(question, top_k=top_k)
        t1 = time.perf_counter()

        if not sources:
            # Nothing relevant found - don't call the LLM with empty context,
            # it will likely hallucinate an answer instead of saying so.
            t2 = time.perf_counter()
            timings_ms = {
                "retrieval_ms": round((t1 - t0) * 1000, 1),
                "generation_ms": 0.0,
                "total_ms": round((t2 - t0) * 1000, 1),
            }
            return {
                "answer": "I don't know based on the indexed documents.",
                "sources": [],
                "timings_ms": timings_ms,
            }

        try:
            answer = ask_llm(question, sources)
        except Exception as exc:
            raise RuntimeError(f"Answer generation failed: {exc}") from exc

        t2 = time.perf_counter()

        timings_ms = {
            "retrieval_ms": round((t1 - t0) * 1000, 1),
            "generation_ms": round((t2 - t1) * 1000, 1),
            "total_ms": round((t2 - t0) * 1000, 1),
        }

        return {"answer": answer, "sources": sources, "timings_ms": timings_ms}
