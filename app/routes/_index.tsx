import type { Route } from "./+types/_index";
import s from "../styles/index-page.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TsundereChanAI — главная" },
    { name: "description", content: "Панель управления Twitch-ботом TsundereChanAI" },
  ];
}

export default function mainPage() {
  return (
    <main className={s.wrap}>
      <section className={s.hero}>
        <p className={s.badge}>TsundereChanAI</p>
        <h1 className={s.title}>Добро пожаловать в панель управления</h1>
        <p className={s.lead}>
          Подключайте бота к каналу, управляйте его состоянием и используйте AI-команды для интерактива в чате Twitch.
        </p>
      </section>

      <section className={s.grid}>
        <article className={s.card}>
          <h2 className={s.cardTitle}>Что умеет бот</h2>
          <ul className={s.list}>
            <li>Отвечает на сообщения и поддерживает диалог в стиле цундере.</li>
            <li>Работает с таймерами и базовыми командами управления.</li>
            <li>Поддерживает модерационные инструменты для чата.</li>
          </ul>
          <p className={s.text}>
            Для начала работы зайдите через Twitch и подключите бота на странице <strong>«Бот на канале»</strong>.
          </p>
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
      </section>
    </main>
  );
}
