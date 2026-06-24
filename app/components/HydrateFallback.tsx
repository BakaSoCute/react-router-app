/**
 * Shown in static index.html while JS bundles load (SPA mode).
 * Uses inline styles so it works before CSS is hydrated.
 */
export function HydrateFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Загрузка приложения"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        margin: 0,
        background:
          "linear-gradient(165deg, #070414 0%, #0e0528 40%, #120636 70%, #0a0820 100%)",
        color: "rgba(210, 180, 240, 0.68)",
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`@keyframes tsundere-hydrate-spin { to { transform: rotate(360deg); } }`}</style>
      <span
        aria-hidden="true"
        style={{
          width: "2.5rem",
          height: "2.5rem",
          border: "3px solid rgba(255, 110, 199, 0.2)",
          borderTopColor: "#ff6ec7",
          borderRightColor: "#00f5ff",
          borderRadius: "50%",
          animation: "tsundere-hydrate-spin 0.8s linear infinite",
        }}
      />
      <p style={{ margin: 0, fontSize: "0.95rem" }}>Загрузка…</p>
    </div>
  );
}
