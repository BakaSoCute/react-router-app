import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  useAddBotToChannelMutation,
  useGetBotChannelStatusQuery,
  useGetChannelEligibilityQuery,
  useGetManagedChannelsQuery,
  useRemoveBotFromChannelMutation,
  type ChannelEligibilityResponse,
} from "~/api/api";
import { useAuth } from "~/hooks/useAuth";
import { DashboardLayout } from "~/components/dashboard/DashboardLayout";
import {
  IconBrain,
  IconClip,
  IconCommand,
  IconModule,
  IconPlug,
  IconTimer,
} from "~/components/icons";
import s from "./addUser.module.css";

const BotStatusPanel = lazy(() =>
  import("./BotStatusPanel").then((m) => ({ default: m.BotStatusPanel }))
);
const ChatModulesPanel = lazy(() =>
  import("./ChatModulesPanel").then((m) => ({ default: m.ChatModulesPanel }))
);
const ChannelAiPromptPanel = lazy(() =>
  import("./ChannelAiPromptPanel").then((m) => ({ default: m.ChannelAiPromptPanel }))
);
const ChannelAiModelPanel = lazy(() =>
  import("./ChannelAiModelPanel").then((m) => ({ default: m.ChannelAiModelPanel }))
);
const CustomCommandsPanel = lazy(() =>
  import("./CustomCommandsPanel").then((m) => ({ default: m.CustomCommandsPanel }))
);
const TimersPanel = lazy(() =>
  import("./TimersPanel").then((m) => ({ default: m.TimersPanel }))
);
const ClipsPanel = lazy(() =>
  import("./ClipsPanel").then((m) => ({ default: m.ClipsPanel }))
);

function renderLazyPanel(panel: ReactNode) {
  return <Suspense fallback={null}>{panel}</Suspense>;
}

type SectionId = "overview" | "modules" | "ai-prompt" | "ai-model" | "commands" | "timers" | "clips";

const NAV = [
  { id: "overview" as const, label: "Обзор", icon: <IconPlug size={16} /> },
  { id: "modules" as const, label: "Модули", icon: <IconModule size={16} /> },
  { id: "ai-prompt" as const, label: "AI-промт", icon: <IconBrain size={16} /> },
  { id: "ai-model" as const, label: "AI-модель", icon: <IconBrain size={16} /> },
  { id: "commands" as const, label: "Команды", icon: <IconCommand size={16} /> },
  { id: "timers" as const, label: "Таймеры", icon: <IconTimer size={16} /> },
  { id: "clips" as const, label: "Клипы", icon: <IconClip size={16} /> },
];

function pickErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const d = data as {
        message?: string;
        error?: string;
        code?: string;
        reason?: string | null;
        eligibility?: ChannelEligibilityResponse;
      };
      if (d.code === "channel_banned") {
        return d.reason
          ? `Канал заблокирован: ${d.reason}`
          : d.message || "Канал заблокирован для использования бота";
      }
      if (d.code === "channel_not_eligible" && d.eligibility?.failureReasons?.length) {
        return d.eligibility.failureReasons.join(" ");
      }
      if (d.message) return String(d.message);
      if (d.error) return String(d.error);
    }
  }
  return "Ошибка запроса";
}

function broadcasterTypeLabel(t: ChannelEligibilityResponse["broadcasterType"]): string {
  if (t === "partner") return "Partner";
  if (t === "affiliate") return "Affiliate";
  return "нет";
}

export default function AddUser() {
  const { user } = useAuth();
  const { data: managedPayload, isLoading: channelsLoading } = useGetManagedChannelsQuery(undefined, {
    skip: !user?.id,
  });
  const managedChannels = managedPayload?.channels ?? [];

  const [addBot, addState] = useAddBotToChannelMutation();
  const [removeBot, removeState] = useRemoveBotFromChannelMutation();
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [activatedSections, setActivatedSections] = useState<Set<SectionId>>(() => new Set());

  const handleNavigate = useCallback((id: string) => {
    const sectionId = id as SectionId;
    setActiveSection(sectionId);
    setActivatedSections((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
  }, []);

  if (!user?.id) {
    return null;
  }

  const selectedChannel = useMemo(
    () => managedChannels.find((ch) => ch.id === selectedChannelId),
    [managedChannels, selectedChannelId]
  );

  const canManageBotConnection = useMemo(() => {
    if (!user?.id || !selectedChannelId) return false;
    if (selectedChannelId === user.id) return true;
    if (selectedChannel?.source === "self") return true;
    return selectedChannel?.moderatorRole === "lead_moderator";
  }, [user?.id, selectedChannelId, selectedChannel]);

  const statusChannelId = selectedChannelId || user?.id || "";
  const { data: botStatus, isLoading: botStatusLoading } = useGetBotChannelStatusQuery(statusChannelId, {
    skip: !user?.id || !statusChannelId,
  });

  const waitingFirstStatus = botStatusLoading && !botStatus;
  const subscribed = Boolean(botStatus?.subscribed);

  const needsEligibilityCheck =
    canManageBotConnection && Boolean(selectedChannelId) && botStatus?.subscribed !== true;

  const { data: eligibility, isLoading: eligibilityLoading, isError: eligibilityError } =
    useGetChannelEligibilityQuery(selectedChannelId, {
      skip: !needsEligibilityCheck,
    });

  const canConnectBot =
    !needsEligibilityCheck ||
    (eligibility?.success === true && eligibility.eligible === true);

  useEffect(() => {
    if (!user?.id) return;
    if (managedChannels.length > 0) {
      setSelectedChannelId((prev) => {
        if (prev && managedChannels.some((ch) => ch.id === prev)) return prev;
        return managedChannels[0].id;
      });
      return;
    }
    setSelectedChannelId((prev) => (prev ? prev : user.id));
  }, [managedChannels, user?.id]);

  const handleAdd = async () => {
    if (!selectedChannelId) return;
    removeState.reset();
    try {
      await addBot({ channelId: selectedChannelId }).unwrap();
    } catch {
      /* RTK Query */
    }
  };

  const handleRemove = async () => {
    if (!selectedChannelId) return;
    addState.reset();
    try {
      await removeBot({ channelId: selectedChannelId }).unwrap();
    } catch {
      /* RTK Query */
    }
  };

  const addErr =
    addState.isError && !addState.isSuccess ? pickErrorMessage(addState.error) : null;
  const removeErr =
    removeState.isError && !removeState.isSuccess ? pickErrorMessage(removeState.error) : null;

  const channelSelect = (
    <>
      <label className={s.fieldLabel} htmlFor="channelId">
        Канал
      </label>
      <select
        id="channelId"
        className={s.select}
        value={selectedChannelId}
        onChange={(e) => setSelectedChannelId(e.target.value)}
        disabled={channelsLoading || managedChannels.length === 0}
      >
        {managedChannels.length === 0 ? (
          <option value={user.id}>
            {channelsLoading ? "Загрузка…" : `${user.display_name} (ваш)`}
          </option>
        ) : (
          managedChannels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.name || ch.login || ch.id}
              {ch.source === "self"
                ? " (ваш)"
                : ch.moderatorRole === "lead_moderator"
                  ? " (вед. мод.)"
                  : " (мод.)"}
            </option>
          ))
        )}
      </select>
    </>
  );

  const connectionCard = (
    <div className={s.card}>
      <h2 className={s.cardTitle}>Подключение</h2>
      {selectedChannel ? (
        <p className={s.hint}>
          Канал: <strong>{selectedChannel.name || selectedChannel.login || selectedChannel.id}</strong>{" "}
          (<code className={s.code}>{selectedChannel.id}</code>)
        </p>
      ) : (
        <p className={s.hint}>
          Канал: <code className={s.code}>{selectedChannelId || user.id}</code>
        </p>
      )}
      {canManageBotConnection ? (
        <>
          {needsEligibilityCheck && (
            <div
              className={`${s.eligibilityBox} ${
                eligibilityLoading ? "" : eligibility?.eligible ? s.eligibilityOk : s.eligibilityFail
              }`}
              role="status"
            >
              {eligibilityLoading ? (
                <p className={s.eligibilityTitle}>Проверка канала…</p>
              ) : eligibilityError || !eligibility?.success ? (
                <>
                  <p className={s.eligibilityTitle}>Не удалось проверить канал</p>
                  <p className={s.eligibilityMeta}>Повторите позже.</p>
                </>
              ) : eligibility.eligible ? (
                <>
                  <p className={s.eligibilityTitle}>Канал подходит</p>
                  <p className={s.eligibilityMeta}>
                    {eligibility.login ? `@${eligibility.login}` : eligibility.broadcasterId} ·{" "}
                    {broadcasterTypeLabel(eligibility.broadcasterType)}
                    {eligibility.followerTotal !== null ? ` · ${eligibility.followerTotal} фол.` : null}
                  </p>
                </>
              ) : (
                <>
                  <p className={s.eligibilityTitle}>Канал пока не подходит</p>
                  <p className={s.eligibilityMeta}>
                    Нужен Affiliate, Partner или ≥ {eligibility.minFollowers} фол.
                    {eligibility.followerTotal !== null
                      ? ` Сейчас: ${eligibility.followerTotal}, ${broadcasterTypeLabel(eligibility.broadcasterType)}.`
                      : null}
                  </p>
                  {eligibility.failureReasons.length > 0 && (
                    <ul className={s.eligibilityList}>
                      {eligibility.failureReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}

          {waitingFirstStatus ? (
            <p className={s.hint}>Проверка статуса…</p>
          ) : (
            <div className={s.actions}>
              {botStatus != null ? (
                botStatus.subscribed ? (
                  <button
                    type="button"
                    className={s.buttonDanger}
                    disabled={addState.isLoading || removeState.isLoading || !selectedChannelId}
                    onClick={() => void handleRemove()}
                  >
                    {removeState.isLoading ? "Отключение…" : "Отключить бота"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={s.buttonPrimary}
                    disabled={
                      addState.isLoading ||
                      removeState.isLoading ||
                      !selectedChannelId ||
                      !canConnectBot
                    }
                    onClick={() => void handleAdd()}
                  >
                    {addState.isLoading ? "Подключение…" : "Подключить бота"}
                  </button>
                )
              ) : (
                <>
                  <button
                    type="button"
                    className={s.buttonPrimary}
                    disabled={
                      addState.isLoading ||
                      removeState.isLoading ||
                      !selectedChannelId ||
                      !canConnectBot
                    }
                    onClick={() => void handleAdd()}
                  >
                    {addState.isLoading ? "Подключение…" : "Подключить бота"}
                  </button>
                  <button
                    type="button"
                    className={s.buttonDanger}
                    disabled={addState.isLoading || removeState.isLoading || !selectedChannelId}
                    onClick={() => void handleRemove()}
                  >
                    {removeState.isLoading ? "Отключение…" : "Отключить бота"}
                  </button>
                </>
              )}
            </div>
          )}

          {addState.isSuccess && addState.data?.success && (
            <p className={s.ok} role="status">
              {addState.data.message ?? "Бот подключён."}
            </p>
          )}
          {removeState.isSuccess && removeState.data?.success && (
            <p className={s.ok} role="status">
              {removeState.data.message ?? "Бот отключён."}
            </p>
          )}
          {addErr && (
            <p className={s.err} role="alert">
              {addErr}
            </p>
          )}
          {removeErr && (
            <p className={s.err} role="alert">
              {removeErr}
            </p>
          )}
        </>
      ) : (
        <p className={s.hint}>
          Подключать бота может только владелец канала. Модераторы могут просматривать настройки.
        </p>
      )}
    </div>
  );

  const renderSection = () => {
    const channelId = selectedChannelId || user.id;
    const isActivated = activatedSections.has(activeSection);

    switch (activeSection) {
      case "overview":
        return (
          <div className={s.sectionStack}>
            {isActivated
              ? renderLazyPanel(<BotStatusPanel channelId={channelId} />)
              : null}
            {connectionCard}
          </div>
        );
      case "modules":
        return isActivated
          ? renderLazyPanel(<ChatModulesPanel channelId={channelId} subscribed={subscribed} />)
          : null;
      case "ai-prompt":
        return isActivated
          ? renderLazyPanel(<ChannelAiPromptPanel channelId={channelId} subscribed={subscribed} />)
          : null;
      case "ai-model":
        return isActivated
          ? renderLazyPanel(<ChannelAiModelPanel channelId={channelId} subscribed={subscribed} />)
          : null;
      case "commands":
        return isActivated
          ? renderLazyPanel(<CustomCommandsPanel channelId={channelId} subscribed={subscribed} />)
          : null;
      case "timers":
        return isActivated
          ? renderLazyPanel(<TimersPanel channelId={channelId} subscribed={subscribed} />)
          : null;
      case "clips":
        return isActivated
          ? renderLazyPanel(<ClipsPanel channelId={channelId} subscribed={subscribed} />)
          : null;
    }
  };

  return (
    <DashboardLayout
      title="Панель бота"
      subtitle={`@${user.login}`}
      nav={NAV}
      activeId={activeSection}
      onNavigate={handleNavigate}
      sidebarExtra={channelSelect}
    >
      {renderSection()}
    </DashboardLayout>
  );
}
