import { useState } from "react";
import {
  CUSTOM_COMMAND_RESPONSE_MAX,
  CUSTOM_COMMANDS_MAX_PER_CHANNEL,
  type CustomCommandItem,
  type CustomCommandUserLevel,
  useCreateCustomCommandMutation,
  useDeleteCustomCommandMutation,
  useGetCustomCommandsQuery,
  usePatchCustomCommandMutation,
} from "~/api/api";
import s from "./CustomCommandsPanel.module.css";

type Props = {
  channelId: string;
  subscribed: boolean;
};

const USER_LEVEL_OPTIONS: { value: CustomCommandUserLevel; label: string }[] = [
  { value: "everyone", label: "Все" },
  { value: "vip", label: "VIP и выше" },
  { value: "mod", label: "Модераторы" },
  { value: "broadcaster", label: "Только стример" },
];

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

function levelLabel(level: CustomCommandUserLevel): string {
  return USER_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;
}

type CommandRowProps = {
  channelId: string;
  cmd: CustomCommandItem;
  busy: boolean;
};

function CommandRow({ channelId, cmd, busy }: CommandRowProps) {
  const [editing, setEditing] = useState(false);
  const [draftResponse, setDraftResponse] = useState(cmd.response);
  const [draftCooldown, setDraftCooldown] = useState(String(cmd.cooldownSeconds));
  const [draftLevel, setDraftLevel] = useState<CustomCommandUserLevel>(cmd.userLevel);
  const [draftEnabled, setDraftEnabled] = useState(cmd.enabled);

  const [patchCommand, patchState] = usePatchCustomCommandMutation();
  const [deleteCommand, deleteState] = useDeleteCustomCommandMutation();

  const rowBusy = busy || patchState.isLoading || deleteState.isLoading;

  const handleSaveEdit = async () => {
    const cooldownSeconds = Number.parseInt(draftCooldown, 10);
    if (!Number.isFinite(cooldownSeconds)) return;
    try {
      await patchCommand({
        channelId,
        commandId: cmd.id,
        response: draftResponse.trim(),
        cooldownSeconds,
        userLevel: draftLevel,
        enabled: draftEnabled,
      }).unwrap();
      setEditing(false);
    } catch {
      /* RTK */
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Удалить команду !${cmd.name}?`)) return;
    try {
      await deleteCommand({ channelId, commandId: cmd.id }).unwrap();
    } catch {
      /* RTK */
    }
  };

  const toggleEnabled = async () => {
    try {
      await patchCommand({
        channelId,
        commandId: cmd.id,
        enabled: !cmd.enabled,
      }).unwrap();
    } catch {
      /* RTK */
    }
  };

  return (
    <div className={s.row}>
      <div className={s.rowHead}>
        <div>
          <p className={s.cmdName}>
            <code className={s.code}>!{cmd.name}</code>
          </p>
          <p className={s.meta}>
            {cmd.enabled ? "Вкл" : "Выкл"} · cooldown {cmd.cooldownSeconds}с · {levelLabel(cmd.userLevel)} · вызовов:{" "}
            {cmd.useCount}
          </p>
        </div>
        <div className={s.rowActions}>
          <button
            type="button"
            className={s.btn}
            disabled={rowBusy || editing}
            onClick={() => {
              setDraftResponse(cmd.response);
              setDraftCooldown(String(cmd.cooldownSeconds));
              setDraftLevel(cmd.userLevel);
              setDraftEnabled(cmd.enabled);
              setEditing(true);
            }}
          >
            Изменить
          </button>
          <button type="button" className={s.btn} disabled={rowBusy} onClick={() => void toggleEnabled()}>
            {cmd.enabled ? "Выключить" : "Включить"}
          </button>
          <button type="button" className={`${s.btn} ${s.btnDanger}`} disabled={rowBusy} onClick={() => void handleDelete()}>
            Удалить
          </button>
        </div>
      </div>
      {!editing ? (
        <p className={s.responsePreview}>{cmd.response}</p>
      ) : (
        <div className={s.editBlock}>
          <label className={s.label}>
            Ответ
            <textarea
              className={s.textarea}
              value={draftResponse}
              maxLength={CUSTOM_COMMAND_RESPONSE_MAX}
              onChange={(e) => setDraftResponse(e.target.value)}
              disabled={rowBusy}
            />
          </label>
          <div className={s.formRow}>
            <label className={s.label}>
              Cooldown (сек)
              <input
                className={s.input}
                type="number"
                min={0}
                max={3600}
                value={draftCooldown}
                onChange={(e) => setDraftCooldown(e.target.value)}
                disabled={rowBusy}
              />
            </label>
            <label className={s.label}>
              Кто может вызывать
              <select
                className={s.select}
                value={draftLevel}
                onChange={(e) => setDraftLevel(e.target.value as CustomCommandUserLevel)}
                disabled={rowBusy}
              >
                {USER_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.label}>
              <span>Включена</span>
              <input
                type="checkbox"
                checked={draftEnabled}
                onChange={(e) => setDraftEnabled(e.target.checked)}
                disabled={rowBusy}
              />
            </label>
          </div>
          <div className={s.rowActions}>
            <button type="button" className={s.submit} disabled={rowBusy || !draftResponse.trim()} onClick={() => void handleSaveEdit()}>
              Сохранить
            </button>
            <button type="button" className={s.btn} disabled={rowBusy} onClick={() => setEditing(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
      {(patchState.isError || deleteState.isError) && (
        <p className={s.err} role="alert">
          {pickFetchError(patchState.error ?? deleteState.error)}
        </p>
      )}
    </div>
  );
}

export function CustomCommandsPanel({ channelId, subscribed }: Props) {
  const { data, error, isLoading, isError } = useGetCustomCommandsQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const [createCommand, createState] = useCreateCustomCommandMutation();

  const [newName, setNewName] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [newCooldown, setNewCooldown] = useState("5");
  const [newLevel, setNewLevel] = useState<CustomCommandUserLevel>("everyone");

  const commands = data?.commands ?? [];
  const atLimit = commands.length >= CUSTOM_COMMANDS_MAX_PER_CHANNEL;
  const formBusy = createState.isLoading;

  const handleCreate = async () => {
    const name = newName.trim().replace(/^!+/, "");
    const response = newResponse.trim();
    const cooldownSeconds = Number.parseInt(newCooldown, 10);
    if (!name || !response || !Number.isFinite(cooldownSeconds)) return;
    try {
      await createCommand({
        channelId,
        name,
        response,
        cooldownSeconds,
        userLevel: newLevel,
        enabled: true,
      }).unwrap();
      setNewName("");
      setNewResponse("");
      setNewCooldown("5");
      setNewLevel("everyone");
    } catch {
      /* RTK */
    }
  };

  if (!subscribed) {
    return (
      <section className={s.panel} aria-label="Кастомные команды">
        <h2 className={s.title}>Кастомные команды</h2>
        <p className={s.muted}>
          После подключения бота здесь можно добавить команды вида <code className={s.code}>!имя</code> с текстовым
          ответом в чат.
        </p>
      </section>
    );
  }

  if (isLoading && !data) {
    return (
      <section className={s.panel} aria-busy="true">
        <h2 className={s.title}>Кастомные команды</h2>
        <p className={s.loading}>Загрузка…</p>
      </section>
    );
  }

  if (isError || !data?.success) {
    return (
      <section className={s.panel}>
        <h2 className={s.title}>Кастомные команды</h2>
        <p className={s.err} role="alert">
          {pickFetchError(error)}
        </p>
      </section>
    );
  }

  return (
    <section className={s.panel} aria-label="Кастомные команды">
      <h2 className={s.title}>Кастомные команды</h2>
      <p className={s.lead}>
        Зрители пишут <code className={s.code}>!имя</code> в чат — бот отвечает заданным текстом. Работает даже при{" "}
        <code className={s.code}>!baka off</code>. Имена <code className={s.code}>baka</code> и похожие зарезервированы.
        Включение модуля — в блоке «Модули чата».
      </p>
      <p className={s.vars}>
        Переменные: <code className={s.code}>$(user)</code>, <code className={s.code}>$(channel)</code>,{" "}
        <code className={s.code}>$(query)</code> (текст после команды), <code className={s.code}>$(count)</code>,{" "}
        <code className={s.code}>$(random 1 100)</code>
      </p>

      {commands.length > 0 ? (
        <div className={s.list}>
          {commands.map((cmd) => (
            <CommandRow key={cmd.id} channelId={channelId} cmd={cmd} busy={formBusy} />
          ))}
        </div>
      ) : (
        <p className={s.muted}>Пока нет команд. Добавьте первую ниже.</p>
      )}

      {!atLimit ? (
        <div className={s.form}>
          <p className={s.formTitle}>Новая команда</p>
          <label className={s.label}>
            Имя (без !)
            <input
              className={s.input}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="discord"
              disabled={formBusy}
              maxLength={32}
            />
          </label>
          <label className={s.label}>
            Ответ
            <textarea
              className={s.textarea}
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              maxLength={CUSTOM_COMMAND_RESPONSE_MAX}
              disabled={formBusy}
              placeholder="Привет, $(user)! Наш Discord: …"
            />
          </label>
          <div className={s.formRow}>
            <label className={s.label}>
              Cooldown (сек)
              <input
                className={s.input}
                type="number"
                min={0}
                max={3600}
                value={newCooldown}
                onChange={(e) => setNewCooldown(e.target.value)}
                disabled={formBusy}
              />
            </label>
            <label className={s.label}>
              Кто может вызывать
              <select
                className={s.select}
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as CustomCommandUserLevel)}
                disabled={formBusy}
              >
                {USER_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            className={s.submit}
            disabled={formBusy || !newName.trim() || !newResponse.trim()}
            onClick={() => void handleCreate()}
          >
            {createState.isLoading ? "Добавление…" : "Добавить команду"}
          </button>
          {createState.isError && (
            <p className={s.err} role="alert">
              {pickFetchError(createState.error)}
            </p>
          )}
          {createState.isSuccess && (
            <p className={s.ok} role="status">
              Команда добавлена.
            </p>
          )}
        </div>
      ) : (
        <p className={s.muted}>Достигнут лимит {CUSTOM_COMMANDS_MAX_PER_CHANNEL} команд на канал.</p>
      )}
    </section>
  );
}
