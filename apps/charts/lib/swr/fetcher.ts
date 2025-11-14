import type { ApiError } from "@/lib/types/api";

/**
 * Universal API fetcher for SWR
 * Handles response parsing and error throwing
 */
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    // Create error with message from API
    const error = new Error(errorData.error || "An error occurred");
    // Attach extra info
    (error as Error & { status: number; info: ApiError }).status = response.status;
    (error as Error & { status: number; info: ApiError }).info = errorData;
    throw error;
  }

  const data = await response.json() as T;
  return data;
}

/**
 * Fetcher with automatic data unwrapping
 * Useful when API returns { data: {...} }
 */
export async function fetcherWithUnwrap<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    const error = new Error(errorData.error || "An error occurred");
    (error as Error & { status: number; info: ApiError }).status = response.status;
    (error as Error & { status: number; info: ApiError }).info = errorData;
    throw error;
  }

  const json = await response.json() as Record<string, unknown>;
  // If response has a data wrapper, unwrap it
  if ('data' in json && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
}

/**
 * POST fetcher for mutations
 */
export async function postFetcher<TResponse, TRequest = unknown>(
  url: string,
  { arg }: { arg: TRequest }
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    const error = new Error(errorData.error || "An error occurred");
    (error as Error & { status: number; info: ApiError }).status = response.status;
    (error as Error & { status: number; info: ApiError }).info = errorData;
    throw error;
  }

  const data = await response.json() as TResponse;
  return data;
}

/**
 * PATCH fetcher for mutations
 */
export async function patchFetcher<TResponse, TRequest = unknown>(
  url: string,
  { arg }: { arg: TRequest }
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    const error = new Error(errorData.error || "An error occurred");
    (error as Error & { status: number; info: ApiError }).status = response.status;
    (error as Error & { status: number; info: ApiError }).info = errorData;
    throw error;
  }

  const data = await response.json() as TResponse;
  return data;
}

/**
 * DELETE fetcher for mutations
 */
export async function deleteFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    const error = new Error(errorData.error || "An error occurred");
    (error as Error & { status: number; info: ApiError }).status = response.status;
    (error as Error & { status: number; info: ApiError }).info = errorData;
    throw error;
  }

  const data = await response.json() as T;
  return data;
}
