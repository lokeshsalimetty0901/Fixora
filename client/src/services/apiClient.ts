/**
 * FIXORA API Client & Response Handler
 * Provides safe response body parsing, robust error formatting,
 * and unified handling for empty, non-JSON, and HTTP error responses.
 */

export class ApiError extends Error {
  statusCode: number;
  data: any;
  isDatabaseError: boolean;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.isDatabaseError =
      statusCode === 503 ||
      (data && typeof data === 'object' && (data.code === 'DATABASE_UNREACHABLE' || data.code === 'DATABASE_UNAVAILABLE'));
  }
}

/**
 * Safely parses any Fetch Response body.
 * - Reads body as text first to prevent 'Unexpected end of JSON input'
 * - Handles empty responses (status 204, empty 500/502/504, 0-byte proxies)
 * - Safely detects JSON vs HTML/plaintext
 * - Throws descriptive ApiError on HTTP 4xx/5xx
 * - Never treats an HTTP error or empty response as a successful login/payload
 */
export async function parseApiResponse<T = any>(response: Response): Promise<T> {
  let rawText = '';
  try {
    rawText = await response.text();
  } catch (readError: any) {
    throw new ApiError(
      `Failed to read response from server: ${readError?.message || 'Unknown network error'}`,
      response.status
    );
  }

  const trimmed = rawText.trim();
  let parsedJson: any = null;
  let isJson = false;

  if (trimmed.length > 0) {
    try {
      parsedJson = JSON.parse(trimmed);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  // Handle HTTP Error responses (4xx, 5xx)
  if (!response.ok) {
    let errorMessage = '';

    if (isJson && parsedJson && typeof parsedJson === 'object') {
      errorMessage = parsedJson.error || parsedJson.message;
    }

    if (!errorMessage) {
      if (response.status === 503) {
        errorMessage = 'Database service is temporarily unavailable. Please verify PostgreSQL is running at localhost:5432.';
      } else if (response.status === 502 || response.status === 504) {
        errorMessage = 'Backend server is unreachable or timed out. Please ensure the FIXORA server is running on port 5000.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (response.status === 404) {
        errorMessage = 'The requested endpoint or resource was not found.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request payload. Please check the submitted fields.';
      } else if (response.status === 409) {
        errorMessage = 'A conflict occurred. This record or booking already exists.';
      } else if (response.status >= 500) {
        errorMessage = 'An internal server error occurred. Please try again later.';
      } else {
        errorMessage = `Request failed with HTTP status ${response.status}.`;
      }
    }

    // Guard against leaking raw HTML tags to users
    if (typeof errorMessage === 'string' && (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html'))) {
      errorMessage = `Server error (${response.status}). Please check server logs.`;
    }

    throw new ApiError(errorMessage, response.status, parsedJson || trimmed);
  }

  // Handle HTTP 200-299 Success responses
  if (!trimmed) {
    // Empty body on success (e.g. 204 No Content or empty 200)
    return {} as T;
  }

  if (isJson) {
    return parsedJson as T;
  }

  return trimmed as unknown as T;
}

/**
 * Universal safe API fetch wrapper
 */
export async function apiFetch<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);
    return await parseApiResponse<T>(response);
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'TypeError' && typeof error.message === 'string' && error.message.includes('fetch')) {
      throw new ApiError(
        'Unable to connect to the FIXORA server. Please verify the backend is running at http://localhost:5000.',
        0
      );
    }

    throw new ApiError(error.message || 'An unexpected network error occurred.', 0);
  }
}

/**
 * Convenience helper for GET requests
 */
export function apiGet<T = any>(url: string, token?: string | null): Promise<T> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return apiFetch<T>(url, { method: 'GET', headers });
}

/**
 * Convenience helper for POST requests
 */
export function apiPost<T = any>(url: string, body?: any, token?: string | null): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return apiFetch<T>(url, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience helper for PATCH requests
 */
export function apiPatch<T = any>(url: string, body?: any, token?: string | null): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return apiFetch<T>(url, {
    method: 'PATCH',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
