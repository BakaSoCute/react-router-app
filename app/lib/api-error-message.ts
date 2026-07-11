export type ApiErrorPayload = {
  message?: string;
  error?: string;
  code?: string;
  unavailable?: boolean;
  reason?: string | null;
};

/** Human-readable message from RTK Query / fetch error payloads. */
export function pickApiErrorMessage(error: unknown, fallback = "Ошибка запроса"): string {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: number | string }).status;
    if (status === "FETCH_ERROR") {
      return "Ошибка сети. Проверьте подключение и повторите.";
    }
    if (status === "TIMEOUT_ERROR") {
      return "Превышено время ожидания ответа сервера.";
    }
  }

  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const d = data as ApiErrorPayload;

      if (d.code === "BOT_CONNECT_TIMEOUT") {
        return (
          d.message ||
          "Не удалось подключиться к серверу бота. Повторите через несколько секунд."
        );
      }
      if (d.code === "STREAM_PROXY_FAILED") {
        return d.message || "Ошибка потока обновления статуса.";
      }
      if (d.unavailable) {
        return d.message || "Сервис бота временно недоступен.";
      }
      if (d.message) return String(d.message);
      if (d.error) return String(d.error);
    }
  }

  return fallback;
}
