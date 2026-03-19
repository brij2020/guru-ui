import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, API_ENDPOINTS, AUTH_STORAGE_KEY, buildApiUrl } from "@/lib/apiConfig";

type AuthState = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  [key: string]: unknown;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: Record<string, unknown>;
  };
};

const readAuthState = (): AuthState | null => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
};

const writeAuthState = (nextState: AuthState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
};

const clearAuthState = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const updateStoredTokens = (accessToken: string, refreshToken?: string, user?: Record<string, unknown>) => {
  const current = readAuthState() || {};
  const next: AuthState = {
    ...current,
    ...(user || {}),
    token: accessToken,
    accessToken,
    refreshToken: refreshToken || current.refreshToken,
  };
  writeAuthState(next);
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const auth = readAuthState();
  const refreshToken = auth?.refreshToken;

  if (!refreshToken) return null;

  const response = await axios.post<RefreshResponse>(
    buildApiUrl(API_ENDPOINTS.auth.refreshToken),
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );

  const data = response.data?.data;
  if (!data?.accessToken) {
    throw new Error("Invalid refresh-token response");
  }

  updateStoredTokens(data.accessToken, data.refreshToken, data.user);
  return data.accessToken;
};

apiClient.interceptors.request.use((config) => {
  const auth = readAuthState();
  const accessToken = auth?.accessToken || auth?.token;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes(API_ENDPOINTS.auth.login) ||
      originalRequest.url?.includes(API_ENDPOINTS.auth.refreshToken);

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      if (!newAccessToken) {
        clearAuthState();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthState();
      return Promise.reject(refreshError);
    }
  }
);

export { readAuthState, writeAuthState, clearAuthState, updateStoredTokens };
