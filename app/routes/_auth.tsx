import { Outlet, Navigate, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import s from "~/styles/auth-layout.module.css";

export default function AuthLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={s.loading}>
        <span className={s.spinner} aria-hidden="true" />
        <p>Проверка авторизации…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
