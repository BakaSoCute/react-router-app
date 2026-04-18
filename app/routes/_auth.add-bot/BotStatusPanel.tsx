import { useEffect, useState } from "react";
import { useGetBotChannelStatusQuery } from "~/api/api";
import s from "./BotStatusPanel.module.css";

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function statusMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const d = data as { message?: string; error?: string; unavailable?: boolean };
      if (d.unavailable) {
        return d.message || "Сервер бота не настроен (RAILWAY_BOT_URL / BOT_API_SECRET).";
      }
      if (d.message) return String(d.message);
      if (d.error) return String(d.error);
    }
  }
  return "Не удалось загрузить статус";
}

type Props = {
  channelId: string;
};

export function BotStatusPanel({ channelId }: Props) {
  const { data, error, isLoading, isFetching, isError, refetch } = useGetBotChannelStatusQuery(
    channelId,
    {
      skip: !channelId,
      pollingInterval: 30_000,
    }
  );

  const endsAt = data?.timer?.endsAt;
  const timerActive = Boolean(data?.timer?.active && endsAt && endsAt > Date.now());

  const [displayMs, setDisplayMs] = useState(0);

  useEffect(() => {
    if (!timerActive || !endsAt) {
      setDisplayMs(0);
      return;
    }
    const tick = () => setDisplayMs(Math.max(0, endsAt - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timerActive, endsAt, data?.timer?.remainingMs]);

  if (isLoading && !data) {
    return (
      <section className={s.panel} aria-busy="true">
        <h2 className={s.panelTitle}>Статус бота</h2>
        <p className={s.loading}>Загрузка…</p>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className={s.panel}>
        <h2 className={s.panelTitle}>Статус бота</h2>
        <p className={s.errorBox} role="alert">
          {statusMessage(error)}
        </p>
        <button type="button" className={s.retry} onClick={() => void refetch()}>
          Повторить
        </button>
      </section>
    );
  }

  const botAnswering =
    data.subscribed && data.eventsubConnected && data.botEnabled;

  return (
    <section className={s.panel}>
      <h2 className={s.panelTitle}>Статус бота на канале</h2>

      <div className={s.grid}>
        <div className={s.row}>
          <span className={s.label}>Подключение к боту</span>
          <span className={s.value}>
            {data.subscribed ? (
              <span className={`${s.badge} ${data.eventsubConnected ? s.badgeOk : s.badgeWarn}`}>
                <span
                  className={`${s.dot} ${data.eventsubConnected ? "" : s.pulse}`}
                  style={{
                    background: data.eventsubConnected ? "#4ade80" : "#facc15",
                  }}
                />
                {data.eventsubConnected
                  ? "Канал в списке, EventSub активен"
                  : "Канал в списке, EventSub не готов"}
              </span>
            ) : (
              <span className={`${s.badge} ${s.badgeOff}`}>
                <span className={s.dot} style={{ background: "#f87171" }} />
                Не подключён
              </span>
            )}
          </span>
        </div>

        <div className={s.row}>
          <span className={s.label}>Ответы в чате (!baka)</span>
          <span className={s.value}>
            {!data.subscribed ? (
              <span className={s.meta}>Сначала подключите бота</span>
            ) : data.botEnabled ? (
              <span className={`${s.badge} ${s.badgeOk}`}>Включена</span>
            ) : (
              <span className={`${s.badge} ${s.badgeOff}`}>Выключена (!baka off)</span>
            )}
          </span>
        </div>

        <div className={s.row}>
          <span className={s.label}>Стрим</span>
          <span className={s.value}>
            <span className={`${s.badge} ${data.streamLive ? s.badgeOk : s.badgeWarn}`}>
              {data.streamLive ? "В эфире" : "Не в эфире"}
            </span>
          </span>
        </div>

        <div className={s.row}>
          <span className={s.label}>Таймер !baka timer</span>
          <span className={s.value}>
            {timerActive && displayMs > 0 ? (
              <>
                <span className={s.timerBig}>{formatCountdown(displayMs)}</span>
                {data.timer.totalMinutes != null ? (
                  <div className={s.meta}>
                    Задано: {data.timer.totalMinutes} мин.
                  </div>
                ) : null}
              </>
            ) : (
              <span className={s.meta}>Не запущен</span>
            )}
          </span>
        </div>
      </div>

      <p className={s.polling}>
        {isFetching ? "Обновление…" : "Автообновление каждые 30 с"}
        {botAnswering ? " · бот может отвечать в чате" : ""}
      </p>
    </section>
  );
}
