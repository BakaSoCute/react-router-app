import { useEffect, useMemo, useState } from "react";
import {
  useAddBotToChannelMutation,
  useGetBotChannelStatusQuery,
  useGetManagedChannelsQuery,
  useGetUserQuery,
  useRemoveBotFromChannelMutation,
} from "~/api/api";
import { BotStatusPanel } from "./BotStatusPanel";
import s from "./addUser.module.css";

function pickErrorMessage(error: unknown): string {
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

export default function AddUser() {
  const { data: userPayload, isLoading: userLoading } = useGetUserQuery();
  const { data: managedPayload, isLoading: channelsLoading } = useGetManagedChannelsQuery();
  const user = userPayload?.user;
  const managedChannels = managedPayload?.channels ?? [];

  const [addBot, addState] = useAddBotToChannelMutation();
  const [removeBot, removeState] = useRemoveBotFromChannelMutation();
  const [selectedChannelId, setSelectedChannelId] = useState("");

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

  if (userLoading || !user?.id) {
    return (
      <div className={s.wrap}>
        <p className={s.lead}>Загрузка профиля…</p>
      </div>
    );
  }

  return (
    <div className={s.wrap}>
      <h1 className={s.title}>Бот на вашем канале</h1>
      <p className={s.lead}>
        Вы вошли как <strong>{user.display_name}</strong> (@{user.login}). Для списка каналов и статуса нужен scope{" "}
        <code className={s.code}>user:read:moderated_channels</code>; чтобы подключать или отключать бота — ещё{" "}
        <code className={s.code}>channel:manage:moderators</code> и права владельца канала или ведущего модератора.
      </p>

      <div className={s.card}>
        <h2 className={s.cardTitle}>Выбор канала</h2>
        <label className={s.fieldLabel} htmlFor="channelId">
          Управляемый канал
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
              {channelsLoading ? "Загрузка каналов..." : `${user.display_name} (ваш канал)`}
            </option>
          ) : (
            managedChannels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name || ch.login || ch.id}
                {ch.source === "self"
                  ? " (ваш канал)"
                  : ch.moderatorRole === "lead_moderator"
                    ? " (ведущий модератор)"
                    : " (модератор)"}
              </option>
            ))
          )}
        </select>
        <p className={s.hint}>
          Статус бота доступен на вашем канале и на каналах, где вы модератор. Подключение и отключение — только для
          вашего канала или если вы ведущий модератор.
        </p>
      </div>

      <BotStatusPanel channelId={selectedChannelId || user.id} />

      <div className={s.card}>
        <h2 className={s.cardTitle}>Подключение</h2>
        {selectedChannel ? (
          <p className={s.hint}>
            Текущий канал: <strong>{selectedChannel.name || selectedChannel.login || selectedChannel.id}</strong>{" "}
            (<code className={s.code}>{selectedChannel.id}</code>)
          </p>
        ) : (
          <p className={s.hint}>
            Текущий канал: <code className={s.code}>{selectedChannelId || user.id}</code>
          </p>
        )}
        {canManageBotConnection ? (
          <>
            {waitingFirstStatus ? (
              <p className={s.hint}>Проверка статуса подключения…</p>
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
                      {removeState.isLoading ? "Отключение…" : "Отключить бота и снять модератора"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={s.buttonPrimary}
                      disabled={addState.isLoading || removeState.isLoading || !selectedChannelId}
                      onClick={() => void handleAdd()}
                    >
                      {addState.isLoading ? "Подключение…" : "Подключить бота и выдать модератора"}
                    </button>
                  )
                ) : (
                  <>
                    <button
                      type="button"
                      className={s.buttonPrimary}
                      disabled={addState.isLoading || removeState.isLoading || !selectedChannelId}
                      onClick={() => void handleAdd()}
                    >
                      {addState.isLoading ? "Подключение…" : "Подключить бота и выдать модератора"}
                    </button>
                    <button
                      type="button"
                      className={s.buttonDanger}
                      disabled={addState.isLoading || removeState.isLoading || !selectedChannelId}
                      onClick={() => void handleRemove()}
                    >
                      {removeState.isLoading ? "Отключение…" : "Отключить бота и снять модератора"}
                    </button>
                  </>
                )}
              </div>
            )}

            {addState.isSuccess && addState.data?.success && (
              <p className={s.ok} role="status">
                {addState.data.message ?? "Бот подписан на канал и добавлен в модераторы."}
              </p>
            )}
            {removeState.isSuccess && removeState.data?.success && (
              <p className={s.ok} role="status">
                {removeState.data.message ?? "Бот отписан от канала, роль модератора снята."}
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
            На этом канале подключать и отключать бота может только владелец или ведущий модератор. Обычные модераторы
            могут смотреть статус выше, но не менять подписку бота.
          </p>
        )}
      </div>
    </div>
  );
}
