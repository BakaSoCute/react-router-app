import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

const CHUNK_RELOAD_KEY = "tsundere-chunk-reload";

/** Recover from 404/502 on preloaded chunks after deploy (stale index.html vs new assets). */
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
    window.location.reload();
    return;
  }
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
});

ReactDOM.hydrateRoot(
  document,
    <HydratedRouter />
);
