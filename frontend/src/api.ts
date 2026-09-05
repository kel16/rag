const API_URL = "http://127.0.0.1:8000";

export async function query(question: string, topK = 3): Promise<QueryResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, top_k: topK }),
    });
  } catch {
    throw new Error(`Couldn't reach the API at ${API_URL}. Is it running?`);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<QueryResponse>;
}
