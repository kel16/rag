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
