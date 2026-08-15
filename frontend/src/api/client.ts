// Thin fetch wrapper shared by every api/*.ts resource module.
//
// Deliberately does NOT import the auth store (that would create a circular
// import: store -> api -> store). Instead the auth store calls
// `setAuthToken` whenever the token changes, and registers an
// `setUnauthorizedHandler` callback so a 401 from any request can log the
// user out globally without this module knowing anything about zustand.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData = false } = options;

  const headers: Record<string, string> = {};
  if (!isFormData && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError(0, "Could not reach the server. Please check your connection and try again.");
  }

  if (res.status === 401) {
    setAuthToken(null);
    unauthorizedHandler?.();
  }

  if (res.status === 204) {
    if (!res.ok) throw new ApiClientError(res.status, "Request failed");
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : res.statusText || "Something went wrong";
    const code =
      data && typeof data === "object" && "code" in data && typeof (data as { code: unknown }).code === "string"
        ? (data as { code: string }).code
        : undefined;
    throw new ApiClientError(res.status, message, code);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown): Promise<T> => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown): Promise<T> => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string, body?: unknown): Promise<T> => request<T>(path, { method: "DELETE", body }),
  postForm: <T>(path: string, formData: FormData): Promise<T> => request<T>(path, { method: "POST", body: formData, isFormData: true }),
  putForm: <T>(path: string, formData: FormData): Promise<T> => request<T>(path, { method: "PUT", body: formData, isFormData: true }),
};
