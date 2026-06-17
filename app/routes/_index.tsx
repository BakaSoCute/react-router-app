import type { Route } from "./+types/_index";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Mascot } from "~/components/Mascot";
import { IconBot, IconBrain, IconCommand, IconSparkle, IconTimer, IconTwitch } from "~/components/icons";
import s from "../styles/index-page.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TsundereChanAI — главная" },
    { name: "description", content: "Панель управления Twitch-ботом TsundereChanAI" },
  ];
}

const FEATURES = [
  {
    icon: IconBrain,
    title: "AI-диалог",
    text: "Отвечает в чате в стиле цундере — с памятью через @TsundereChanAI или без памяти через !baka.",
  },
  {
    icon: IconCommand,
    title: "Свои команды",
    text: "Создавайте кастомные команды с переменными и уровнями доступа.",
  },
  {
    icon: IconTimer,
    title: "Таймеры и модули",
    text: "Таймеры в чате и на сайте. Включайте и отключайте функции бота по модулям.",
  },
] as const;

export default function mainPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className={s.wrap}>
      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.badge}>
            <IconSparkle size={14} />
            TsundereChanAI · beta
          </p>
          <h1 className={s.title}>
            Твой <span className={s.titleAccent}>tsundere</span>-бот для Twitch
          </h1>
          <p className={s.lead}>
            Подключай бота к каналу, настраивай AI-модель и промт, управляй модулями и командами — всё из удобной панели.
          </p>
          <div className={s.actions}>
            {isAuthenticated ? (
              <>
                <Link className={s.ctaPrimary} to="/channels">
                  <IconBot size={18} />
                  Открыть панель
                </Link>
                <Link className={s.ctaGhost} to="/profile">
                  Профиль
                </Link>
              </>
            ) : (
              <Link className={s.ctaPrimary} to="/login">
                <IconTwitch size={18} />
                Войти через Twitch
              </Link>
            )}
          </div>
        </div>
        {/* <Mascot size="lg" className={s.mascot} /> */}
      </section>

      <section className={s.features}>
        {FEATURES.map(({ icon: IconComp, title, text }) => (
          <article key={title} className={s.featureCard}>
            <span className={s.featureIcon}>
              <IconComp size={22} />
            </span>
            <h2 className={s.featureTitle}>{title}</h2>
            <p className={s.featureText}>{text}</p>
          </article>
        ))}
      </section>

      <section className={s.commandsSection}>
        <h2 className={s.sectionTitle}>
          <IconCommand size={20} />
          Команды в чате
        </h2>
        <div className={s.commandsGrid}>
          <article className={s.commandGroup}>
            <h3 className={s.commandGroupTitle}>Для всех</h3>
            <ul className={s.list}>
              <li>
                <code className={s.code}>!baka "запрос"</code> — запрос без памяти
              </li>
              <li>
                <code className={s.code}>!baka status</code> — статус бота и таймеры
              </li>
              <li>
                <code className={s.code}>@TsundereChanAI "запрос"</code> — с памятью
              </li>
            </ul>
          </article>
          <article className={s.commandGroup}>
            <h3 className={s.commandGroupTitle}>Для модераторов</h3>
            <ul className={s.list}>
              <li>
                <code className={s.code}>!baka on/off</code> — вкл/выкл бота
              </li>
              <li>
                <code className={s.code}>!timer clear [имя]</code> — отмена таймера
              </li>
            </ul>
          </article>
          <article className={s.commandGroup}>
            <h3 className={s.commandGroupTitle}>Настраиваемые</h3>
            <ul className={s.list}>
              <li>
                <code className={s.code}>!timer [N] [имя]</code> — таймер на N минут
              </li>
              <li>
                <code className={s.code}>!baka timer …</code> — то же, что !timer
              </li>
            </ul>
          </article>
        </div>
      </section>

      <footer className={s.footer}>
        <p>Разработчик: BakaSoCute</p>
        <p>
          Вопросы и предложения —{" "}
          <a href="https://t.me/bakasocute" className={s.footerLink} target="_blank" rel="noreferrer">
            Telegram @BakaSoCute
          </a>
        </p>
      </footer>
    </main>
  );
}
