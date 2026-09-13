import { env } from "../config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function client<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  if (!response.ok) {
    const detail = await response.text();

    throw new ApiError(
      detail || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
