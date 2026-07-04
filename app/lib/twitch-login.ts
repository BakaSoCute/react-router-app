import { getBackendUrl } from "~/lib/backend-url";

export function redirectToTwitchLogin(): void {
  const origin = encodeURIComponent(window.location.origin);
  window.location.href = `${getBackendUrl()}/api/auth/twitch?origin=${origin}`;
}
