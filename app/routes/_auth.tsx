import { Outlet, Navigate, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";

/**
 * Защищенный layout для маршрутов, требующих авторизации
 * Все роуты, начинающиеся с _auth.*, будут защищены этим layout
 */
export default function AuthLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Показываем загрузку во время проверки авторизации
  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Если авторизован, рендерим дочерние роуты
  return <Outlet />;
}
