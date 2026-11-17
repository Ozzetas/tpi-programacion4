import axios from "axios";

interface ValidationErrorItem {
  loc?: Array<string | number>;
  msg?: string;
}

interface FastApiErrorResponse {
  detail?: string | ValidationErrorItem[];
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<FastApiErrorResponse>(error)) {
    if (!error.response) {
      return "Error de conexión con el servidor. Verifique que el backend esté en ejecución.";
    }

    const detail = error.response.data?.detail;

    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => item.msg ?? "Dato inválido")
        .join(". ");
    }

    return `Error del servidor (código ${error.response.status}).`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado al procesar la solicitud.";
}