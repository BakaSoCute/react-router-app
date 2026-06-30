import s from "./css/Login.module.css";
import { IconTwitch } from "~/components/icons";
import { getBackendUrl } from "~/lib/backend-url";

export const Login = () => {
  const handleSubmit = () => {
    const origin = encodeURIComponent(window.location.origin);
        window.location.href = `${getBackendUrl()}/api/auth/twitch?origin=${origin}`;;
  };

  return (
    <main className={s.main}>
      <section className={s.card}>
        <h1 className={s.title}>Вход в TsundereChanAI</h1>
        <p className={s.text}>
          Авторизуйтесь через Twitch, чтобы подключать бота к каналу, управлять статусом и настройками.
        </p>
        <button className={s.button} type="button" onClick={handleSubmit}>
          <IconTwitch size={20} />
          Войти через Twitch
        </button>
      </section>
    </main>
  );
};
