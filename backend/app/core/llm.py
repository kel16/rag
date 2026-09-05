from litellm import completion

LLM_MODEL = "ollama/phi3"
OLLAMA_API_BASE = "http://localhost:11434"

def call_llm(prompt: str) -> str:
    response = completion(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}],
        api_base=OLLAMA_API_BASE,
    )
    
    return response["choices"][0]["message"]["content"]


def ask_llm(question: str, context_chunks: list[dict]) -> str:
    """
    context_chunks: list of {"text": ..., "source": ...} dicts, so the
    prompt can tell the model which document each piece of context came
    from.
    """
    context = "\n\n---\n\n".join(
        f"[Source: {c['source']}]\n{c['text']}" for c in context_chunks
    )

    prompt = f"""Answer the question using ONLY the context below.
    If the answer isn't in the context, say you don't know based on the documents.

    Context:
    {context}

    Question: {question}

    Answer:"""

    return call_llm(prompt)
