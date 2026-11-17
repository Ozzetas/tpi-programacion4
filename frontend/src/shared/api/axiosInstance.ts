import axios, { AxiosError } from "axios";

interface ApiErrorPayload {
  detail?: string | Array<{ msg: string }>;
}

type SessionCleanupHandler = () => void;

let onSessionInvalidated: SessionCleanupHandler | null = null;

export function registerSessionCleanup(handler: SessionCleanupHandler): void {
  onSessionInvalidated = handler;
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const detail = error.response?.data?.detail;

    // Ante 401 fuera de /auth/token y /auth/me, o 400 por cuenta desactivada, limpio el estado de sesión local
    const isAuthAttemptOrCheck =
      requestUrl.includes("/auth/token") || requestUrl.includes("/auth/me");

    const isUnauthorizedSession = status === 401 && !isAuthAttemptOrCheck;
    const isDisabledAccount =
      status === 400 &&
      typeof detail === "string" &&
      detail === "Cuenta de usuario desactivada";

    if ((isUnauthorizedSession || isDisabledAccount) && onSessionInvalidated) {
      onSessionInvalidated();
    }

    return Promise.reject(error);
  }
);