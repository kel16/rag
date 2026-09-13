import { type FormEvent, useState } from "react";
import { query } from "../api/query";
import type { IExchange } from "../api/types";
import { useRequest } from "../hooks/useRequest";
import { Header, History } from "./components";
import { Alert, Button } from "../components/atoms";

export default function DocumentQaPage() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<IExchange[]>([]);

  const {
    error,
    isLoading,
    request,
  } = useRequest(query);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = question.trim();

    if (!trimmed || isLoading) {
      return;
    }

    try {
      const data = await request(trimmed, 3);

      setHistory((prev) => [
        {
          ...data,
          id: crypto.randomUUID(),
        },
        ...prev,
      ]);

      setQuestion("");
    } catch {
    }
  }

  return (
      <div className="mx-auto max-w-4xl">
        <Header />

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="question" className="sr-only">
              Question
            </label>

            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What does the document say about…"
              disabled={isLoading}
              autoFocus
              className="
                w-full rounded-lg border border-slate-300
                bg-white px-4 py-3 text-slate-900 shadow-sm
                outline-none transition
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/20
                disabled:cursor-not-allowed
                disabled:bg-slate-100
                disabled:text-slate-500
              "
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? "Thinking…" : "Ask"}
          </Button>
        </form>

        {error && (
          <Alert variant="error" className="mt-4">
            {error.message}
          </Alert>
        )}

        <History history={history} isLoading={isLoading} className="mt-8" />
      </div>
  );
}
