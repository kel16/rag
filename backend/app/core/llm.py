from litellm import completion
from litellm.exceptions import APIConnectionError, APIError, Timeout

from app.config import settings
from app.schemas import SourceChunk


def call_llm(prompt: str) -> str:
    try:
        response = completion(
            model=settings.llm_model,
            messages=[{"role": "user", "content": prompt}],
            api_base=settings.ollama_api_base,
            timeout=settings.llm_timeout_seconds,
        )
    except APIConnectionError as exc:
        raise RuntimeError(
            f"Could not reach the LLM at {settings.ollama_api_base}. Is Ollama running?"
        ) from exc
    except Timeout as exc:
        raise RuntimeError("The LLM took too long to respond.") from exc
    except APIError as exc:
        raise RuntimeError(f"The LLM call failed: {exc}") from exc

    choices = response.get("choices") or []
    if not choices or not choices[0].get("message", {}).get("content"):
        raise RuntimeError("The LLM returned an empty response.")

    content = choices[0]["message"]["content"]
    return str(content)


def ask_llm(question: str, context_chunks: list[SourceChunk]) -> str:
    """
    context_chunks: retrieved passages, so the prompt can tell the model
    which document each piece of context came from.
    """
    context = "\n\n---\n\n".join(f"[Source: {c.source}]\n{c.text}" for c in context_chunks)

    prompt = (
        "Answer the question using ONLY the context below. "
        "If the answer isn't in the context, say you don't know based on the documents.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer:"
    )

    return call_llm(prompt)
