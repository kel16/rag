import clsx from "clsx";

import { IExchange } from "@/api/types";

import { HistoryItem } from "./components";

interface IHistoryProps {
  history: IExchange[];
  isLoading: boolean;
  className?: string;
}

export default function History(props: IHistoryProps) {
  const { history, isLoading, className } = props;

  return (
    <section className={clsx("space-y-5", className)}>
      {history.length === 0 && !isLoading && (
        <p
          className="
                rounded-lg border border-dashed
                border-slate-300 p-8
                text-center text-slate-500
              "
        >
          No questions asked yet. Try one above.
        </p>
      )}

      {history.map(exchange => (
        <HistoryItem
          key={exchange.id}
          id={exchange.id}
          question={exchange.question}
          answer={exchange.answer}
          sources={exchange.sources}
          timings_ms={exchange.timings_ms}
        />
      ))}
    </section>
  );
}
