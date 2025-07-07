import { ClientError, ServerError } from "./errors";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(BASE_URL + url, options);
    if (!response.ok) {
      if (response.status >= 500) {
        throw new ServerError(`Server error: ${response.status} - ${response.statusText}`);
      } else if (response.status >= 400) {
        throw new ClientError(`Client error: ${response.status} - ${response.statusText}`);
      }
      throw new Error(`Unexpected response: ${response.status} - ${response.statusText}`);
    }
    return await (response.json() as Promise<T>);
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
