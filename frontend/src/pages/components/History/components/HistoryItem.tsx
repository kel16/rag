import { IExchange } from "@/api/types";

export default function HistoryItem(exchange: IExchange) {
  return (
    <article
      className="
                rounded-xl border border-slate-200
                bg-white p-5 shadow-sm
              "
    >
      <div className="space-y-5">
        {/* Question */}
        <div>
          <p className="text-sm font-medium text-slate-500">Question</p>

          <p className="mt-1 font-medium text-slate-900">{exchange.question}</p>
        </div>

        {/* Answer */}
        <div>
          <p className="text-sm font-medium text-slate-500">Answer</p>

          <p className="mt-1 whitespace-pre-wrap leading-7 text-slate-700">{exchange.answer}</p>
        </div>

        {/* Sources */}
        <details className="rounded-lg bg-slate-50 p-4">
          <summary className="cursor-pointer font-medium text-slate-700">
            Source passages ({exchange.sources.length})
          </summary>

          <ul className="mt-4 space-y-3">
            {exchange.sources.map((source, index) => (
              <li
                key={`${source.source}-${index}`}
                className="
                          border-l-2 border-slate-300
                          pl-3 text-sm leading-6 text-slate-600
                        "
              >
                <span className="font-medium text-slate-900">{source.source}</span>

                <span className="ml-2">{source.text}</span>
              </li>
            ))}
          </ul>
        </details>

        {/* Timing information */}
        <p className="text-xs text-slate-400">
          retrieval {exchange.timings_ms.retrieval_ms}ms
          {" · "}
          generation {exchange.timings_ms.generation_ms}ms
          {" · "}
          total {exchange.timings_ms.total_ms}ms
        </p>
      </div>
    </article>
  );
}
