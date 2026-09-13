import { client } from "./client";
import { IQueryResponse } from "./types";

export async function query(question: string, topK = 3): Promise<IQueryResponse> {
  return client<IQueryResponse>("/query", {
    method: "POST",
    body: JSON.stringify({
      question,
      top_k: topK,
    }),
  });
}
