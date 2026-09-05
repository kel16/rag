export default function HistoryItem(exchange: Exchange) {
    return (
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
    )
}
