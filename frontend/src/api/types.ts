export interface ISourceChunk {
  text: string;
  source: string;
}

export interface IQueryResponse {
  question: string;
  answer: string;
  sources: ISourceChunk[];
  timings_ms: {
    retrieval_ms: number;
    generation_ms: number;
    total_ms: number;
  };
}

export interface IExchange extends IQueryResponse {
  id: string;
}
