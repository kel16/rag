import { client } from "./client";

export async function query(
  question: string,
  topK = 3,
): Promise<QueryResponse> {
  return client<QueryResponse>("/query", {
    method: "POST",
    body: JSON.stringify({
      question,
      top_k: topK,
    }),
  });
}
