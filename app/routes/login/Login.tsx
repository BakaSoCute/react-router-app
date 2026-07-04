import s from "./css/Login.module.css";
import { IconTwitch } from "~/components/icons";
import { redirectToTwitchLogin } from "~/lib/twitch-login";
import { useState } from "react";

export const Login = () => {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = () => {
    if (isPending) return;
    setIsPending(true);
    redirectToTwitchLogin();
  };

  return (
    <main className={s.main}>
      <section className={s.card}>
        <h1 className={s.title}>Вход в TsundereChanAI</h1>
        <p className={s.text}>
          Авторизуйтесь через Twitch, чтобы подключать бота к каналу, управлять статусом и настройками.
        </p>
        <button className={s.button} type="button" disabled={isPending} aria-busy={isPending} onClick={handleSubmit}>
          <IconTwitch size={20} />
          {isPending ? "Перенаправление…" : "Войти через Twitch"}
        </button>
      </section>
    </main>
  );
};
