import type { Route } from "./+types/_index";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import s from "../styles/index-page.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TsundereChanAI — главная" },
    { name: "description", content: "Панель управления Twitch-ботом TsundereChanAI" },
  ];
}

export default function mainPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className={s.wrap}>
      <section className={s.hero}>
        <p className={s.badge}>TsundereChanAI-beta</p>
        <h1 className={s.title}>Добро пожаловать в панель управления</h1>
        <p className={s.lead}>
          Подключайте бота к каналу, управляйте его состоянием и используйте AI-команды для интерактива в чате Twitch. Сайт находится в разработке, но вы уже можете подключать бота.
        </p>
      </section>

      <section className={s.grid}>
        <article className={s.card}>
          <h2 className={s.cardTitle}>Что умеет бот</h2>
          <ul className={s.list}>
            <li>Отвечает на сообщения и поддерживает диалог в стиле цундере.</li>
            <li>Работает с таймерами и базовыми командами управления.</li>
          </ul>
          <p className={s.text}>
            Для начала работы зайдите через Twitch и подключите бота на странице <strong>«Каналы и бот»</strong>.
          </p>
          <div className={s.actions}>
            {isAuthenticated ? (
              <>
                <Link className={s.ctaPrimary} to="/channels">
                  Открыть каналы и бота
                </Link>
                <Link className={s.ctaGhost} to="/profile">
                  Перейти в профиль
                </Link>
              </>
            ) : (
              <Link className={s.ctaPrimary} to="/login">
                Войти через Twitch
              </Link>
            )}
          </div>
        </article>

        <article className={s.card}>
          <h2 className={s.cardTitle}>Команды</h2>
          <ul className={s.list}>
            <li>
              <code className={s.code}>!baka "запрос"</code> - запрос к боту без учёта памяти.
            </li>
            <li>
              <code className={s.code}>!baka status</code> - информация о состоянии бота.
            </li>
            <li>
              <code className={s.code}>!baka on/off</code> - включение или выключение бота.
            </li>
            <li>
              <code className={s.code}>!baka timer "число"</code> - таймер на N минут.
            </li>
            <li>
              <code className={s.code}>!baka timer clear</code> - очистка таймера.
            </li>
          </ul>

          <p className={s.text}>
            Команды <code className={s.code}>on/off/timer/timer clear</code> доступны только модераторам и стримеру.
          </p>
          <p className={s.text}>
            Обращение <code className={s.code}>@TsundereChanAI</code> работает с памятью. Также можно отвечать прямо на сообщение бота.
          </p>
        </article>
        <article className={s.card}>
          <h3>Контакты</h3>
          <p>Разработчик: BakaSoCute</p>
          <p className={s.text}>
            Если у вас есть вопросы или предложения пишите в телеграм.
          </p>
          <p className={s.text}>Telegram: <a href="https://t.me/bakasocute">@BakaSoCute</a></p>
        </article>
      </section>
    </main>
  );
}
