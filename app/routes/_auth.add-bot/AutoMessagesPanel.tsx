import { useState } from "react";
import {
  AUTO_INTERVAL_MAX_SECONDS,
  AUTO_INTERVAL_MIN_SECONDS,
  AUTO_MESSAGES_MAX_PER_CHANNEL,
  CUSTOM_COMMAND_RESPONSE_MAX,
  type AutoMessageItem,
  type AutoResponseType,
  useCreateAutoMessageMutation,
  useDeleteAutoMessageMutation,
  useGetAutoMessagesQuery,
  usePatchAutoMessageMutation,
} from "~/api";
import { PanelSkeleton } from "~/components/dashboard/PanelSkeleton";
import s from "./CustomCommandsPanel.module.css";

type Props = {
  channelId: string;
  subscribed: boolean;
};

function pickFetchError(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const d = data as { message?: string; error?: string };
      if (d.message) return String(d.message);
      if (d.error) return String(d.error);
    }
  }
  return "Ошибка запроса";
}

const AUTO_RESPONSE_TYPE_OPTIONS: { value: AutoResponseType; label: string }[] = [
  { value: "chat", label: "Сообщение в чат" },
  { value: "announcement", label: "Announcement в чате" },
];

function autoResponseTypeLabel(type: AutoResponseType): string {
  return AUTO_RESPONSE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function minutesToSeconds(minutes: number): number | null {
  if (!Number.isFinite(minutes)) return null;
  const sec = Math.round(minutes * 60);
  if (sec < AUTO_INTERVAL_MIN_SECONDS || sec > AUTO_INTERVAL_MAX_SECONDS) return null;
  return sec;
}

type MessageRowProps = {
  channelId: string;
  item: AutoMessageItem;
  busy: boolean;
};

function MessageRow({ channelId, item, busy }: MessageRowProps) {
  const [editing, setEditing] = useState(false);
  const [draftMessage, setDraftMessage] = useState(item.message);
  const [draftMinutes, setDraftMinutes] = useState(String(Math.round(item.intervalSeconds / 60)));
  const [draftEnabled, setDraftEnabled] = useState(item.enabled);
  const [draftLiveOnly, setDraftLiveOnly] = useState(item.liveOnly);
  const [draftMinLines, setDraftMinLines] = useState(String(item.minChatLines));
  const [draftResponseType, setDraftResponseType] = useState<AutoResponseType>(item.responseType ?? "chat");

  const [patchMessage, patchState] = usePatchAutoMessageMutation();
  const [deleteMessage, deleteState] = useDeleteAutoMessageMutation();
  const rowBusy = busy || patchState.isLoading || deleteState.isLoading;

  const save = async () => {
    const intervalSeconds = minutesToSeconds(Number.parseFloat(draftMinutes));
    const minChatLines = Number.parseInt(draftMinLines, 10);
    if (intervalSeconds == null || !Number.isFinite(minChatLines)) return;
    try {
      await patchMessage({
        channelId,
        messageId: item.id,
        message: draftMessage.trim(),
        intervalSeconds,
        enabled: draftEnabled,
        liveOnly: draftLiveOnly,
        minChatLines,
        responseType: draftResponseType,
      }).unwrap();
      setEditing(false);
    } catch {
      /* RTK */
    }
  };

  const remove = async () => {
    if (!window.confirm("Удалить авто-сообщение?")) return;
    try {
      await deleteMessage({ channelId, messageId: item.id }).unwrap();
    } catch {
      /* RTK */
    }
  };

  const toggle = async () => {
    try {
      await patchMessage({ channelId, messageId: item.id, enabled: !item.enabled }).unwrap();
    } catch {
      /* RTK */
    }
  };

  return (
    <div className={s.row}>
      <div className={s.rowHead}>
        <div>
          <p className={s.meta}>
            {item.enabled ? "Вкл" : "Выкл"} · каждые {Math.round(item.intervalSeconds / 60)} мин · отправок: {item.useCount}
            {item.liveOnly ? " · только в эфире" : ""}
            {item.minChatLines > 0 ? ` · мин. ${item.minChatLines} сообщ. в чате` : ""}
            {` · ${autoResponseTypeLabel(item.responseType ?? "chat")}`}
          </p>
        </div>
        <div className={s.rowActions}>
          <button type="button" className={s.btn} disabled={rowBusy || editing} onClick={() => {
            setDraftMessage(item.message);
            setDraftMinutes(String(Math.round(item.intervalSeconds / 60)));
            setDraftEnabled(item.enabled);
            setDraftLiveOnly(item.liveOnly);
            setDraftMinLines(String(item.minChatLines));
            setDraftResponseType(item.responseType ?? "chat");
            setEditing(true);
          }}>
            Изменить
          </button>
          <button type="button" className={s.btn} disabled={rowBusy} onClick={() => void toggle()}>
            {item.enabled ? "Выключить" : "Включить"}
          </button>
          <button type="button" className={`${s.btn} ${s.btnDanger}`} disabled={rowBusy} onClick={() => void remove()}>
            Удалить
          </button>
        </div>
      </div>
      {!editing ? (
        <p className={s.responsePreview}>{item.message}</p>
      ) : (
        <div className={s.editBlock}>
          <label className={s.label}>
            Текст
            <textarea
              className={s.textarea}
              value={draftMessage}
              maxLength={CUSTOM_COMMAND_RESPONSE_MAX}
              onChange={(e) => setDraftMessage(e.target.value)}
              disabled={rowBusy}
            />
          </label>
          <div className={s.formRow}>
            <label className={s.label}>
              Интервал (мин)
              <input
                className={s.input}
                type="number"
                min={1}
                max={1440}
                value={draftMinutes}
                onChange={(e) => setDraftMinutes(e.target.value)}
                disabled={rowBusy}
              />
            </label>
            <label className={s.label}>
              Мин. сообщений в чате
              <input
                className={s.input}
                type="number"
                min={0}
                max={500}
                value={draftMinLines}
                onChange={(e) => setDraftMinLines(e.target.value)}
                disabled={rowBusy}
              />
            </label>
            <label className={s.label}>
              <span>Включено</span>
              <input type="checkbox" checked={draftEnabled} onChange={(e) => setDraftEnabled(e.target.checked)} disabled={rowBusy} />
            </label>
            <label className={s.label}>
              <span>Только в эфире</span>
              <input type="checkbox" checked={draftLiveOnly} onChange={(e) => setDraftLiveOnly(e.target.checked)} disabled={rowBusy} />
            </label>
          </div>
          <label className={s.label}>
            Тип отправки
            <select
              className={s.select}
              value={draftResponseType}
              onChange={(e) => setDraftResponseType(e.target.value as AutoResponseType)}
              disabled={rowBusy}
            >
              {AUTO_RESPONSE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className={s.rowActions}>
            <button type="button" className={s.submit} disabled={rowBusy || !draftMessage.trim()} onClick={() => void save()}>
              Сохранить
            </button>
            <button type="button" className={s.btn} disabled={rowBusy} onClick={() => setEditing(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AutoMessagesPanel({ channelId, subscribed }: Props) {
  const { data, error, isLoading, isError } = useGetAutoMessagesQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const [createMessage, createState] = useCreateAutoMessageMutation();

  const [newMessage, setNewMessage] = useState("");
  const [newMinutes, setNewMinutes] = useState("15");
  const [newLiveOnly, setNewLiveOnly] = useState(true);
  const [newMinLines, setNewMinLines] = useState("0");
  const [newResponseType, setNewResponseType] = useState<AutoResponseType>("chat");

  const messages = data?.messages ?? [];
  const atLimit = messages.length >= AUTO_MESSAGES_MAX_PER_CHANNEL;

  const handleCreate = async () => {
    const intervalSeconds = minutesToSeconds(Number.parseFloat(newMinutes));
    const minChatLines = Number.parseInt(newMinLines, 10);
    const message = newMessage.trim();
    if (!message || intervalSeconds == null || !Number.isFinite(minChatLines)) return;
    try {
      await createMessage({
        channelId,
        message,
        intervalSeconds,
        enabled: true,
        liveOnly: newLiveOnly,
        minChatLines,
        responseType: newResponseType,
      }).unwrap();
      setNewMessage("");
      setNewMinutes("15");
      setNewMinLines("0");
    } catch {
      /* RTK */
    }
  };

  if (!subscribed) return null;

  if (isLoading && !data) {
    return <PanelSkeleton title="Авто-сообщения" rows={3} />;
  }

  if (isError || !data?.success) {
    return (
      <section className={s.panel}>
        <h2 className={s.title}>Авто-сообщения</h2>
        <p className={s.err} role="alert">
          {pickFetchError(error)}
        </p>
      </section>
    );
  }

  return (
    <section className={s.panel} aria-label="Авто-сообщения" style={{ marginTop: "1rem" }}>
      <h2 className={s.title}>Авто-сообщения</h2>
      <p className={s.lead}>
        Периодическая отправка текста в чат (1–1440 мин). Поддерживаются те же переменные, что у команд. Модуль «Авто-сообщения» в «Модули чата».
      </p>

      {messages.length > 0 ? (
        <div className={s.list}>
          {messages.map((item) => (
            <MessageRow key={item.id} channelId={channelId} item={item} busy={createState.isLoading} />
          ))}
        </div>
      ) : (
        <p className={s.muted}>Нет авто-сообщений.</p>
      )}

      {!atLimit ? (
        <div className={s.form}>
          <p className={s.formTitle}>Новое авто-сообщение</p>
          <label className={s.label}>
            Текст
            <textarea
              className={s.textarea}
              value={newMessage}
              maxLength={CUSTOM_COMMAND_RESPONSE_MAX}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Не забудьте подписаться! $(channel)"
            />
          </label>
          <div className={s.formRow}>
            <label className={s.label}>
              Интервал (мин)
              <input className={s.input} type="number" min={1} max={1440} value={newMinutes} onChange={(e) => setNewMinutes(e.target.value)} />
            </label>
            <label className={s.label}>
              Мин. сообщений в чате
              <input className={s.input} type="number" min={0} max={500} value={newMinLines} onChange={(e) => setNewMinLines(e.target.value)} />
            </label>
            <label className={s.label}>
              <span>Только в эфире</span>
              <input type="checkbox" checked={newLiveOnly} onChange={(e) => setNewLiveOnly(e.target.checked)} />
            </label>
            <label className={s.label}>
              Тип отправки
              <select
                className={s.select}
                value={newResponseType}
                onChange={(e) => setNewResponseType(e.target.value as AutoResponseType)}
              >
                {AUTO_RESPONSE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" className={s.submit} disabled={createState.isLoading || !newMessage.trim()} onClick={() => void handleCreate()}>
            Добавить
          </button>
          {createState.isError && <p className={s.err}>{pickFetchError(createState.error)}</p>}
        </div>
      ) : (
        <p className={s.muted}>Лимит {AUTO_MESSAGES_MAX_PER_CHANNEL} авто-сообщений.</p>
      )}
    </section>
  );
}
