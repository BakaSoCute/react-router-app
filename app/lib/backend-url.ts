/** API всегда на сервере — и в dev, и в prod. */
export function getBackendUrl(): string {
  return import.meta.env.VITE_BACKEND_URL ?? '';
}
