import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import s from "./main-page.module.css";

export function ProfileView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user?.id) {
    return <div className={s.loading}>Загрузка профиля...</div>;
  }

  return (
    <main className={s.wrap}>
      <h1 className={s.title}>Ваш профиль</h1>
      <p className={s.subtitle}>
        Проверяйте данные аккаунта и переходите к управлению ботом на выбранном канале.
      </p>
      <div className={s.profile}>
        <img
          src={user.profile_image_url}
          alt={user.display_name}
          width={96}
          height={96}
        />
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Login:</strong> {user.login}
        </p>
        <p>
          <strong>Имя:</strong> {user.display_name}
        </p>
        <p>
          <strong>Email:</strong> {user.email || "не указан"}
        </p>
        <Link to="/channels" className={s.actionLink}>
          Открыть управление ботом
        </Link>
      </div>
    </main>
  );
}
