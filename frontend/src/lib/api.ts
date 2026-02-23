export interface ApiValidationError {
  msg?: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  pagination?: ApiPagination;
  message?: string;
  errors?: ApiValidationError[];
}

export class ApiError extends Error {
  status: number;
  errors?: ApiValidationError[];

  constructor(message: string, status: number, errors?: ApiValidationError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
}

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Auto-detect production environment if VITE_API_URL is missing
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://devloperameen-safesesa-1.onrender.com/api";
  }

  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const payload = await apiRequestWithMeta<T>(endpoint, options);
  return payload.data;
}

export async function apiRequestWithMeta<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const authToken =
    token ||
    (typeof window !== "undefined" ? localStorage.getItem("eduflow_token") : null);

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error("API Request failed:", err);
    throw new ApiError("Could not connect to the server. Please check your internet connection or try again later.", 0);
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.success === false) {
    const message =
      payload?.message ||
      payload?.errors?.[0]?.msg ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload?.errors);
  }

  return payload;
}
