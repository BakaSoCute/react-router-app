import { Outlet, Navigate, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { AppLoader } from "~/components/AppLoader";

export default function AuthLayout() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <AppLoader message="Проверка сессии…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
