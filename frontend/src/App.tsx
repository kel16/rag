import { useState, FormEvent } from "react";

const API_URL = "http://127.0.0.1:8000";

interface SourceChunk {
  text: string;
  source: string;
}

interface QueryResponse {
  question: string;
  answer: string;
  sources: SourceChunk[];
  timings_ms: {
    retrieval_ms: number;
    generation_ms: number;
    total_ms: number;
  };
}

interface Exchange extends QueryResponse {
  id: number;
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, top_k: 3 }),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Request failed (${res.status}): ${detail}`);
      }

      const data: QueryResponse = await res.json();
      setHistory((prev) => [{ ...data, id: Date.now() }, ...prev]);
      setQuestion("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Is the API running at " + API_URL + "?"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Document Q&amp;A</h1>
        <p className="subtitle">Ask a question. Answers are grounded in your document's own text.</p>
      </header>

      <form className="ask-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What does the document say about…"
          disabled={isLoading}
          autoFocus
        />
        <button type="submit" disabled={isLoading || !question.trim()}>
          {isLoading ? "Thinking…" : "Ask"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="history">
        {history.length === 0 && !isLoading && (
          <p className="empty">No questions asked yet. Try one above.</p>
        )}

        {history.map((exchange) => (
          <article className="exchange" key={exchange.id}>
            <p className="question">{exchange.question}</p>
            <p className="answer">{exchange.answer}</p>

            <details className="sources">
              <summary>Source passages ({exchange.sources.length})</summary>
              <ul>
                {exchange.sources.map((source, i) => (
                  <li key={i}>
                    <span className="source-doc">{source.source}</span>
                    {source.text}
                  </li>
                ))}
              </ul>
            </details>

            <p className="timing">
              retrieval {exchange.timings_ms.retrieval_ms}ms · generation{" "}
              {exchange.timings_ms.generation_ms}ms · total{" "}
              {exchange.timings_ms.total_ms}ms
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
