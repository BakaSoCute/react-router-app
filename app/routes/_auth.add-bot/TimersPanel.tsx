import { useEffect, useState } from "react";
import {
  type ChannelTimerSnapshot,
  type CustomCommandUserLevel,
  useCancelChannelTimerMutation,
  useGetChannelTimersQuery,
  useGetUserQuery,
  usePatchTimerPermissionMutation,
  useStartChannelTimerMutation,
} from "~/api/api";
import s from "./TimersPanel.module.css";

type Props = {
  channelId: string;
  subscribed: boolean;
};

const USER_LEVEL_OPTIONS: { value: CustomCommandUserLevel; label: string }[] = [
  { value: "everyone", label: "Любой зритель" },
  { value: "vip", label: "VIP и выше" },
  { value: "mod", label: "Модераторы и выше" },
  { value: "broadcaster", label: "Только стример" },
];

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

const TIMER_ERROR_LABELS: Record<string, string> = {
  timer_already_active: "Таймер с таким именем уже запущен.",
  timers_limit_reached: "Достигнут лимит активных таймеров на канале (15).",
  invalid_timer_name: "Некорректное имя таймера (2–32 символа: латиница, кириллица, цифры, _).",
  invalid_minutes: "Укажите длительность от 2 до 240 минут.",
  started_by_required: "Не удалось определить пользователя.",
};

function pickFetchError(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const d = data as { message?: string; error?: string };
      if (typeof d.error === "string" && TIMER_ERROR_LABELS[d.error]) {
        return TIMER_ERROR_LABELS[d.error];
      }
      if (d.message) return String(d.message);
      if (d.error) return String(d.error);
    }
    if ("status" in error) {
      const status = (error as { status?: number }).status;
      if (status === 409) {
        return TIMER_ERROR_LABELS.timer_already_active;
      }
    }
  }
  return "Ошибка запроса";
}

function displayTimerTitle(timer: ChannelTimerSnapshot): string {
  return timer.nameIsDefault ? `@${timer.name}` : timer.name;
}

type ActiveRowProps = {
  timer: ChannelTimerSnapshot;
  busy: boolean;
  onCancel: (name: string) => void;
};

function ActiveTimerRow({ timer, busy, onCancel }: ActiveRowProps) {
  const [displayMs, setDisplayMs] = useState(0);

  useEffect(() => {
    const tick = () => setDisplayMs(Math.max(0, timer.endsAt - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timer.endsAt]);

  const active = displayMs > 0;

  return (
    <div className={s.row}>
      <div className={s.rowHead}>
        <h3 className={s.timerName}>{displayTimerTitle(timer)}</h3>
        <button
          type="button"
          className={s.buttonDanger}
          disabled={busy || !active}
          onClick={() => onCancel(timer.name)}
        >
          Отменить
        </button>
      </div>
      {active ? (
        <>
          <span className={s.timerBig}>{formatCountdown(displayMs)}</span>
          <p className={s.meta}>
            Задано: {timer.totalMinutes} мин. · вызвал @{timer.startedByLogin}
          </p>
        </>
      ) : (
        <p className={s.meta}>Завершается…</p>
      )}
    </div>
  );
}

export function TimersPanel({ channelId, subscribed }: Props) {
  const { data: userPayload } = useGetUserQuery();
  const userLogin = userPayload?.user?.login ?? "";

  const { data, error, isLoading, isFetching, refetch } = useGetChannelTimersQuery(channelId, {
    skip: !channelId || !subscribed,
    pollingInterval: 30_000,
  });

  const [startTimer, startState] = useStartChannelTimerMutation();
  const [cancelTimer, cancelState] = useCancelChannelTimerMutation();
  const [patchPermission, patchPermState] = usePatchTimerPermissionMutation();

  const [minutes, setMinutes] = useState("30");
  const [timerName, setTimerName] = useState("");
  const [invokeLevel, setInvokeLevel] = useState<CustomCommandUserLevel>("mod");
  const [startErr, setStartErr] = useState<string | null>(null);

  const busy = startState.isLoading || cancelState.isLoading || patchPermState.isLoading;

  const active = data?.active ?? [];
  const serverInvokeLevel = data?.invokeUserLevel ?? "mod";

  useEffect(() => {
    setInvokeLevel(serverInvokeLevel);
  }, [serverInvokeLevel]);

  const handleInvokeLevelChange = async (next: CustomCommandUserLevel) => {
    setInvokeLevel(next);
    try {
      await patchPermission({ channelId, userLevel: next }).unwrap();
    } catch {
      setInvokeLevel(serverInvokeLevel);
    }
  };

  const handleStart = async () => {
    const m = Number.parseInt(minutes, 10);
    if (!Number.isFinite(m)) return;
    setStartErr(null);
    try {
      const body: { channelId: string; minutes: number; name?: string } = {
        channelId,
        minutes: m,
      };
      const trimmedName = timerName.trim();
      if (trimmedName) body.name = trimmedName;
      await startTimer(body).unwrap();
      setTimerName("");
    } catch (e) {
      setStartErr(pickFetchError(e));
    }
  };

  const handleCancel = async (name: string) => {
    try {
      await cancelTimer({ channelId, name }).unwrap();
    } catch {
      /* RTK */
    }
  };

  if (!subscribed) {
    return (
      <section className={s.panel}>
        <h2 className={s.title}>Таймеры</h2>
        <p className={s.lead}>Подключите бота к каналу, чтобы управлять таймерами.</p>
      </section>
    );
  }

  if (isLoading && !data) {
    return (
      <section className={s.panel} aria-busy="true">
        <h2 className={s.title}>Таймеры</h2>
        <p className={s.loading}>Загрузка…</p>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className={s.panel}>
        <h2 className={s.title}>Таймеры</h2>
        <p className={s.errorBox} role="alert">
          {pickFetchError(error)}
        </p>
        <button type="button" className={s.buttonGhost} onClick={() => void refetch()}>
          Повторить
        </button>
      </section>
    );
  }

  return (
    <section className={s.panel}>
      <h2 className={s.title}>Таймеры</h2>
      <p className={s.lead}>
        В чате: <code className={s.code}>!timer &lt;мин&gt; [имя]</code> — имя задаёт зритель (без имени
        используется его ник). <code className={s.code}>!baka timer</code> — то же. Отмена:{" "}
        <code className={s.code}>!timer clear [имя] - удаляет конкретный таймер</code> (модераторы).
        <code className={s.code}>!timer clear и !baka timer clear - удаляет все таймеры</code> (модераторы).
      </p>

      <h3 className={s.sectionTitle}>Кто может вызывать !timer в чате</h3>
      <p className={s.lead}>
        Одна настройка на весь канал: какие зрители могут писать команду запуска таймера. Имя каждого таймера
        задаётся отдельно при запуске.
      </p>
      <div className={s.form}>
        <div className={s.field}>
          <label className={s.label} htmlFor="timer-invoke-level">
            Минимальная роль в чате
          </label>
          <select
            id="timer-invoke-level"
            className={s.select}
            value={invokeLevel}
            disabled={busy}
            onChange={(e) => void handleInvokeLevelChange(e.target.value as CustomCommandUserLevel)}
          >
            {USER_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h3 className={s.sectionTitle}>Запустить таймер с сайта</h3>
      <div className={s.form}>
        <div className={s.field}>
          <label className={s.label} htmlFor="timer-minutes">
            Минуты (2–240)
          </label>
          <input
            id="timer-minutes"
            className={s.input}
            type="number"
            min={2}
            max={240}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor="timer-name">
            Имя таймера (необязательно)
          </label>
          <input
            id="timer-name"
            className={s.input}
            type="text"
            placeholder={userLogin ? `по умолчанию @${userLogin}` : "по умолчанию ваш ник"}
            value={timerName}
            onChange={(e) => setTimerName(e.target.value)}
          />
        </div>
        <button type="button" className={s.buttonPrimary} disabled={busy} onClick={() => void handleStart()}>
          {startState.isLoading ? "Запуск…" : "Запустить"}
        </button>
      </div>
      {startErr ? (
        <p className={s.errorBox} role="alert">
          {startErr}
        </p>
      ) : null}

      <h3 className={s.sectionTitle}>Активные таймеры</h3>
      {active.length === 0 ? (
        <p className={s.empty}>Нет активных таймеров.</p>
      ) : (
        <div className={s.list}>
          {active.map((t) => (
            <ActiveTimerRow key={t.name} timer={t} busy={busy} onCancel={(name) => void handleCancel(name)} />
          ))}
        </div>
      )}

      <p className={s.polling}>{isFetching ? "Обновление…" : "Автообновление каждые 30 с"}</p>
    </section>
  );
}
