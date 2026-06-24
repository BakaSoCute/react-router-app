import { Outlet, Navigate, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";

export default function AuthLayout() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (!isBootstrapping && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
