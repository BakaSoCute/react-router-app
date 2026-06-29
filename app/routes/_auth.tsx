import { Outlet, Navigate, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";

function RouteLoader({ message = "Загрузка…" }: { message?: string }) {
  return (
    <div className="app-loader" role="status" aria-live="polite" aria-label={message}>
      <span className="app-loader-spinner" aria-hidden="true" />
      <p className="app-loader-message">{message}</p>
    </div>
  );
}

export default function AuthLayout() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <RouteLoader message="Проверка сессии…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
