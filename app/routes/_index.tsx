import type { Route } from "./+types/_index";
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
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

const COMMAND_DETAILS = [
  {
    title: "Для всех",
    items: [
      {
        cmd: '!baka "запрос"',
        summary: "запрос без памяти",
        detail:
          "Одноразовый ответ ИИ в стиле цундере-учёного — без истории диалога. Подходит для быстрых вопросов. Модель настраиваются в панели канала.",
      },
      {
        cmd: "!baka status",
        summary: "статус бота и таймеры",
        detail:
          "Показывает, включён ли бот на канале, и список активных таймеров с оставшимся временем. Работает даже когда бот выключен командой !baka off.",
      },
      {
        cmd: '@TsundereChanAI "запрос"',
        summary: "с памятью",
        detail:
          "Ответ с учётом недавней переписки в чате (контекст самого пользователя и обращения к боту от других пользователей) — бот помнит контекст. Можно задать свой промт канала в панели; он добавляется к базовому.",
      },
    ],
  },
  {
    title: "Для модераторов",
    items: [
      {
        cmd: "!baka on/off",
        summary: "вкл/выкл бота",
        detail:
          "Выключает или включает ответы бота в чате. При выключении кастомные команды и управление (!baka on, !baka status) остаются доступны.",
      },
      {
        cmd: "!timer clear [имя]",
        summary: "отмена таймера",
        detail:
          "Без имени — отменяет все активные таймеры. С именем — только указанный таймер. Синоним: !baka timer clear.",
      },
    ],
  },
  {
    title: "Настраиваемые",
    items: [
      {
        cmd: "!timer [N] [имя]",
        summary: "таймер на N минут",
        detail:
          "Запускает обратный отсчёт. Имя задаёт зритель; без имени используется его ник. Кто может вызывать команду — настраивается в панели.",
      },
      {
        cmd: "!baka timer …",
        summary: "то же, что !timer",
        detail: "Полный синоним !timer: те же аргументы и поведение. (Поддержка старого синтаксиса)",
      },
      {
        cmd: "!clip [имя] [время]",
        summary: "создание клипа",
        detail:
          "Поля [имя] и [время] необязательны. Если не указано имя, то используется ник зрителя. Если не указано время, то используется 30 секунд.",
      },
    ],
  },
] as const;

export default function mainPage() {
  const { isAuthenticated } = useAuth();
  const [commandsExpanded, setCommandsExpanded] = useState(false);

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
              <li>
                <code className={s.code}>!clip [имя] [время]</code> — создание клипа
              </li>
            </ul>
          </article>
        </div>

        <div className={s.commandsActions}>
          <button
            type="button"
            className={s.detailsToggle}
            aria-expanded={commandsExpanded}
            aria-controls="commands-details"
            onClick={() => setCommandsExpanded((open) => !open)}
          >
            {commandsExpanded ? "Скрыть" : "Подробнее"}
            <span className={`${s.detailsChevron} ${commandsExpanded ? s.detailsChevronOpen : ""}`} aria-hidden>
              ▾
            </span>
          </button>
        </div>

        {commandsExpanded ? (
          <div id="commands-details" className={s.commandsDetails}>
            {COMMAND_DETAILS.map(({ title, items }) => (
              <article key={title} className={s.commandDetailGroup}>
                <h3 className={s.commandGroupTitle}>{title}</h3>
                <ul className={s.commandDetailList}>
                  {items.map(({ cmd, summary, detail }) => (
                    <li key={cmd} className={s.commandDetailItem}>
                      <p className={s.commandDetailHead}>
                        <code className={s.code}>{cmd}</code>
                        <span className={s.commandDetailSummary}>— {summary}</span>
                      </p>
                      <p className={s.commandDetailText}>{detail}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            <p className={s.commandDetailNote}>
              В панели канала можно добавить свои команды вида <code className={s.code}>!имя</code> с переменными{" "}
              <code className={s.code}>$(user)</code>, <code className={s.code}>$(query)</code> и уровнями доступа.
            </p>
          </div>
        ) : null}
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
