import os

from litellm import completion
from litellm.exceptions import APIConnectionError, APIError, Timeout

LLM_MODEL = os.environ.get("LLM_MODEL", "ollama/phi3")
OLLAMA_API_BASE = os.environ.get("OLLAMA_API_BASE", "http://localhost:11434")


def call_llm(prompt: str) -> str:
    try:
        response = completion(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            api_base=OLLAMA_API_BASE,
            timeout=60,
        )
    except APIConnectionError as exc:
        raise RuntimeError(
            f"Could not reach the LLM at {OLLAMA_API_BASE}. Is Ollama running?"
        ) from exc
    except Timeout as exc:
        raise RuntimeError("The LLM took too long to respond.") from exc
    except APIError as exc:
        raise RuntimeError(f"The LLM call failed: {exc}") from exc

    choices = response.get("choices") or []
    if not choices or not choices[0].get("message", {}).get("content"):
        raise RuntimeError("The LLM returned an empty response.")

    return choices[0]["message"]["content"]


def ask_llm(question: str, context_chunks: list[dict]) -> str:
    """
    context_chunks: list of {"text": ..., "source": ...} dicts, so the
    prompt can tell the model which document each piece of context came
    from.
    """
    context = "\n\n---\n\n".join(f"[Source: {c['source']}]\n{c['text']}" for c in context_chunks)

    prompt = (
        "Answer the question using ONLY the context below. "
        "If the answer isn't in the context, say you don't know based on the documents.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer:"
    )

    return call_llm(prompt)
