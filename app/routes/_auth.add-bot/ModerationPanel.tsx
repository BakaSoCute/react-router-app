import { useEffect, useState } from "react";
import {
  MODERATION_CUSTOM_RULES_MAX,
  type ModerationStrictness,
  useAddBlockedUserMutation,
  useGetBlockedUsersQuery,
  useGetChatModulesQuery,
  useGetModerationLogQuery,
  useGetModerationSettingsQuery,
  usePatchChatModuleMutation,
  usePatchModerationSettingsMutation,
  useRemoveBlockedUserMutation,
} from "~/api";
import { PanelSkeleton } from "~/components/dashboard/PanelSkeleton";
import s from "./ModerationPanel.module.css";

type Props = {
  channelId: string;
  subscribed: boolean;
};

const TIMEOUT_OPTIONS = [
  { value: 60, label: "1 минута" },
  { value: 300, label: "5 минут" },
  { value: 600, label: "10 минут" },
  { value: 1800, label: "30 минут" },
  { value: 3600, label: "1 час" },
];

const COOLDOWN_OPTIONS = [
  { value: 60, label: "1 минута" },
  { value: 300, label: "5 минут" },
  { value: 600, label: "10 минут" },
  { value: 1800, label: "30 минут" },
];

const STRICTNESS_OPTIONS: { value: ModerationStrictness; label: string }[] = [
  { value: "low", label: "Низкая — только экстремальные нарушения" },
  { value: "medium", label: "Средняя — серьёзные нарушения" },
  { value: "high", label: "Высокая — спам, токсик, оскорбления" },
];

const PATCH_ERROR_LABELS: Record<string, string> = {
  invalid_default_timeout: "Некорректная длительность таймаута.",
  invalid_cooldown: "Некорректный кулдаун между таймаутами.",
  invalid_strictness: "Некорректный уровень строгости.",
  custom_rules_too_long: `Правила не длиннее ${MODERATION_CUSTOM_RULES_MAX} символов.`,
  nothing_to_update: "Нечего обновлять.",
  invalid_login: "Укажите корректный Twitch-логин.",
  user_not_found: "Пользователь не найден на Twitch.",
  cannot_block_broadcaster: "Нельзя заблокировать стримера.",
  cannot_block_moderator: "Нельзя заблокировать модератора канала.",
  user_not_blocked: "Пользователь не в списке блокировки.",
};

function pickFetchError(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const d = data as { message?: string; error?: string };
      if (typeof d.error === "string" && PATCH_ERROR_LABELS[d.error]) {
        return PATCH_ERROR_LABELS[d.error];
      }
      if (d.message) return String(d.message);
      if (d.error) return String(d.error);
    }
  }
  return "Ошибка запроса";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function actionLabel(action: string): string {
  if (action === "timeout") return "Таймаут (AI)";
  if (action === "block") return "Блокировка";
  if (action === "unblock") return "Разблокировка";
  return action;
}

export function ModerationPanel({ channelId, subscribed }: Props) {
  const { data: settings, isLoading: settingsLoading, error: settingsError } =
    useGetModerationSettingsQuery(channelId, { skip: !channelId || !subscribed });
  const { data: modulesData } = useGetChatModulesQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const { data: blockedData, isLoading: blockedLoading } = useGetBlockedUsersQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const { data: logData, isLoading: logLoading } = useGetModerationLogQuery(
    { channelId, limit: 30 },
    { skip: !channelId || !subscribed }
  );

  const [patchSettings, patchState] = usePatchModerationSettingsMutation();
  const [patchModule, patchModuleState] = usePatchChatModuleMutation();
  const [addBlocked, addBlockedState] = useAddBlockedUserMutation();
  const [removeBlocked, removeBlockedState] = useRemoveBlockedUserMutation();

  const [customRules, setCustomRules] = useState("");
  const [blockLogin, setBlockLogin] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.customRules !== undefined) {
      setCustomRules(settings.customRules ?? "");
    }
  }, [settings?.customRules]);

  const aiModerationEnabled =
    modulesData?.modules.find((m) => m.id === "ai_moderation_tools")?.enabled ?? true;

  const busy =
    patchState.isLoading ||
    patchModuleState.isLoading ||
    addBlockedState.isLoading ||
    removeBlockedState.isLoading;

  if (!subscribed) {
    return (
      <section className={s.panel} aria-label="Модерация">
        <h2 className={s.title}>Модерация</h2>
        <p className={s.lead}>Подключите бота к каналу, чтобы настраивать модерацию.</p>
      </section>
    );
  }

  if (settingsLoading && !settings) {
    return <PanelSkeleton title="Модерация" rows={6} />;
  }

  if (settingsError || !settings?.success) {
    return (
      <section className={s.panel}>
        <h2 className={s.title}>Модерация</h2>
        <p className={s.errorBox}>{pickFetchError(settingsError)}</p>
      </section>
    );
  }

  async function saveSettings(patch: Parameters<typeof patchSettings>[0]) {
    setFormErr(null);
    try {
      await patchSettings({ channelId, ...patch }).unwrap();
    } catch (e) {
      setFormErr(pickFetchError(e));
    }
  }

  async function toggleAiModeration() {
    setFormErr(null);
    try {
      await patchModule({
        channelId,
        moduleId: "ai_moderation_tools",
        enabled: !aiModerationEnabled,
      }).unwrap();
    } catch (e) {
      setFormErr(pickFetchError(e));
    }
  }

  async function handleAddBlock(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const login = blockLogin.trim().replace(/^@/, "");
    if (!login) {
      setFormErr("Укажите логин пользователя.");
      return;
    }
    try {
      await addBlocked({
        channelId,
        login,
        reason: blockReason.trim() || null,
      }).unwrap();
      setBlockLogin("");
      setBlockReason("");
    } catch (err) {
      setFormErr(pickFetchError(err));
    }
  }

  async function handleRemoveBlock(userId: string) {
    setFormErr(null);
    try {
      await removeBlocked({ channelId, userId }).unwrap();
    } catch (err) {
      setFormErr(pickFetchError(err));
    }
  }

  async function saveCustomRules() {
    const trimmed = customRules.trim();
    if (trimmed.length > MODERATION_CUSTOM_RULES_MAX) {
      setFormErr(`Правила не длиннее ${MODERATION_CUSTOM_RULES_MAX} символов.`);
      return;
    }
    await saveSettings({ customRules: trimmed || null });
  }

  return (
    <section className={s.panel} aria-label="Модерация">
      <h2 className={s.title}>Модерация</h2>
      <p className={s.lead}>
        ИИ-таймауты срабатывают при обращении к боту через <code className={s.code}>@TsundereChanAI</code>.
        Заблокированные пользователи не могут вызывать бота (команды, клипы, таймеры, @mention).
      </p>

      <h3 className={s.sectionTitle}>ИИ-модерация (таймауты)</h3>
      <div className={s.form}>
        <div className={s.rowInline}>
          <span className={s.label}>ИИ-таймауты через Twitch</span>
          <button
            type="button"
            className={`${s.toggle} ${aiModerationEnabled ? s.toggleOn : s.toggleOff}`}
            disabled={busy}
            aria-pressed={aiModerationEnabled}
            onClick={() => void toggleAiModeration()}
          >
            {aiModerationEnabled ? "Включено" : "Выключено"}
          </button>
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="mod-default-timeout">
            Таймаут по умолчанию
          </label>
          <select
            id="mod-default-timeout"
            className={s.select}
            value={settings.defaultTimeoutSeconds}
            disabled={busy}
            onChange={(e) =>
              void saveSettings({ defaultTimeoutSeconds: Number.parseInt(e.target.value, 10) })
            }
          >
            {TIMEOUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="mod-cooldown">
            Кулдаун на одного пользователя
          </label>
          <select
            id="mod-cooldown"
            className={s.select}
            value={settings.cooldownSeconds}
            disabled={busy}
            onChange={(e) =>
              void saveSettings({ cooldownSeconds: Number.parseInt(e.target.value, 10) })
            }
          >
            {COOLDOWN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="mod-strictness">
            Строгость классификатора
          </label>
          <select
            id="mod-strictness"
            className={s.select}
            value={settings.strictness}
            disabled={busy}
            onChange={(e) =>
              void saveSettings({ strictness: e.target.value as ModerationStrictness })
            }
          >
            {STRICTNESS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={s.rowInline}>
          <span className={s.label}>Не таймаутить VIP</span>
          <button
            type="button"
            className={`${s.toggle} ${settings.vipExempt ? s.toggleOn : s.toggleOff}`}
            disabled={busy}
            aria-pressed={settings.vipExempt}
            onClick={() => void saveSettings({ vipExempt: !settings.vipExempt })}
          >
            {settings.vipExempt ? "Да" : "Нет"}
          </button>
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="mod-custom-rules">
            Дополнительные правила для ИИ-классификатора
          </label>
          <textarea
            id="mod-custom-rules"
            className={s.textarea}
            rows={4}
            maxLength={MODERATION_CUSTOM_RULES_MAX}
            value={customRules}
            disabled={busy}
            onChange={(e) => setCustomRules(e.target.value)}
            onBlur={() => void saveCustomRules()}
            placeholder="Например: не таймаутить за игровой сленг; таймаутить за рекламу сторонних каналов."
          />
          <p className={s.hint}>
            {customRules.length}/{MODERATION_CUSTOM_RULES_MAX} — сохраняется при потере фокуса
          </p>
        </div>
      </div>

      <h3 className={s.sectionTitle}>Заблокированные пользователи</h3>
      <form className={s.form} onSubmit={(e) => void handleAddBlock(e)}>
        <div className={s.fieldRow}>
          <div className={s.field}>
            <label className={s.label} htmlFor="block-login">
              Twitch-логин
            </label>
            <input
              id="block-login"
              className={s.input}
              value={blockLogin}
              disabled={busy}
              onChange={(e) => setBlockLogin(e.target.value)}
              placeholder="username"
            />
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="block-reason">
              Причина (необязательно)
            </label>
            <input
              id="block-reason"
              className={s.input}
              value={blockReason}
              disabled={busy}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Спам, токсик…"
            />
          </div>
        </div>
        <button type="submit" className={s.buttonPrimary} disabled={busy}>
          Заблокировать
        </button>
      </form>

      {blockedLoading && !blockedData && <p className={s.lead}>Загрузка списка…</p>}
      {blockedData && blockedData.users.length === 0 && (
        <p className={s.lead}>Список пуст — бот отвечает всем (кроме настроек модерации Twitch).</p>
      )}
      {blockedData && blockedData.users.length > 0 && (
        <ul className={s.list}>
          {blockedData.users.map((u) => (
            <li key={u.userId} className={s.row}>
              <div className={s.rowHead}>
                <strong>@{u.userLogin}</strong>
                <button
                  type="button"
                  className={s.buttonDanger}
                  disabled={busy}
                  onClick={() => void handleRemoveBlock(u.userId)}
                >
                  Разблокировать
                </button>
              </div>
              {u.reason && <p className={s.meta}>Причина: {u.reason}</p>}
              <p className={s.meta}>Добавлен: {formatDate(u.blockedAt)}</p>
            </li>
          ))}
        </ul>
      )}

      <h3 className={s.sectionTitle}>Журнал действий</h3>
      {logLoading && !logData && <p className={s.lead}>Загрузка журнала…</p>}
      {logData && logData.entries.length === 0 && (
        <p className={s.lead}>Записей пока нет.</p>
      )}
      {logData && logData.entries.length > 0 && (
        <ul className={s.list}>
          {logData.entries.map((entry) => (
            <li key={entry.id} className={s.row}>
              <div className={s.rowHead}>
                <strong>{actionLabel(entry.action)}</strong>
                <span className={s.meta}>{formatDate(entry.createdAt)}</span>
              </div>
              <p className={s.meta}>
                @{entry.userLogin}
                {entry.durationSeconds != null ? ` · ${entry.durationSeconds} сек.` : null}
                {entry.source === "ai" ? " · AI" : " · вручную"}
              </p>
              {entry.reason && <p className={s.meta}>{entry.reason}</p>}
            </li>
          ))}
        </ul>
      )}

      {formErr && (
        <p className={s.errorBox} role="alert">
          {formErr}
        </p>
      )}
    </section>
  );
}
