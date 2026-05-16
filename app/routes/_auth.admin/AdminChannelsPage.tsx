import { useState } from "react";
import { Navigate } from "react-router";
import {
  useAdminBanChannelMutation,
  useAdminDisconnectChannelMutation,
  useAdminUnbanChannelMutation,
  useGetAdminChannelsQuery,
  useGetAdminMeQuery,
} from "~/api/api";
import s from "./admin.module.css";

function pickError(error: unknown): string {
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

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ru-RU");
  } catch {
    return iso;
  }
}

export function AdminChannelsPage() {
  const { data: me, isLoading: meLoading } = useGetAdminMeQuery();
  const { data, error, isLoading, isFetching, refetch } = useGetAdminChannelsQuery(undefined, {
    skip: !me?.isAdmin,
  });

  const [disconnect, disconnectState] = useAdminDisconnectChannelMutation();
  const [ban, banState] = useAdminBanChannelMutation();
  const [unban, unbanState] = useAdminUnbanChannelMutation();

  const [banReasons, setBanReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const anyBusy =
    disconnectState.isLoading || banState.isLoading || unbanState.isLoading || Boolean(busyId);

  if (meLoading) {
    return (
      <div className={s.wrap}>
        <p className={s.loading}>Проверка доступа…</p>
      </div>
    );
  }

  if (!me?.isAdmin) {
    return <Navigate to="/channels" replace />;
  }

  const handleDisconnect = async (channelId: string) => {
    if (!window.confirm(`Отключить бота от канала ${channelId}?`)) return;
    setBusyId(channelId);
    try {
      await disconnect({ channelId }).unwrap();
      await refetch();
    } catch {
      /* RTK */
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = async (channelId: string) => {
    const reason = banReasons[channelId]?.trim() || undefined;
    if (
      !window.confirm(
        `Забанить канал ${channelId}? Бот будет отключён и не сможет подключиться снова.`
      )
    )
      return;
    setBusyId(channelId);
    try {
      await ban({ channelId, reason }).unwrap();
      setBanReasons((prev) => {
        const next = { ...prev };
        delete next[channelId];
        return next;
      });
      await refetch();
    } catch {
      /* RTK */
    } finally {
      setBusyId(null);
    }
  };

  const handleUnban = async (channelId: string) => {
    if (!window.confirm(`Снять бан с канала ${channelId}?`)) return;
    setBusyId(channelId);
    try {
      await unban({ channelId }).unwrap();
      await refetch();
    } catch {
      /* RTK */
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={s.wrap}>
      <h1 className={s.title}>Админ-панель</h1>
      <p className={s.lead}>
        Управление каналами, подключёнными к боту. Отключение снимает подписку EventSub на сервере; роль
        модератора на Twitch может остаться — её снимает владелец канала вручную.
      </p>

      {isLoading && !data ? (
        <p className={s.loading}>Загрузка списка каналов…</p>
      ) : error || !data?.success ? (
        <p className={s.err} role="alert">
          {pickError(error)}
        </p>
      ) : data.channels.length === 0 ? (
        <p className={s.muted}>Нет каналов в базе и в чёрном списке.</p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Канал</th>
                <th>ID</th>
                <th>Подписка</th>
                <th>Стрим</th>
                <th>Бан</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.channels.map((ch) => {
                const rowBusy = busyId === ch.channelId || anyBusy;
                return (
                  <tr key={ch.channelId}>
                    <td>{ch.login ? `@${ch.login}` : "—"}</td>
                    <td>
                      <code className={s.code}>{ch.channelId}</code>
                    </td>
                    <td>{ch.subscribed ? <span className={s.badgeOk}>да</span> : "нет"}</td>
                    <td>{ch.subscribed && ch.streamLive ? "live" : "—"}</td>
                    <td>
                      {ch.banned ? (
                        <span className={s.badgeBanned} title={ch.banReason ?? undefined}>
                          да
                          {ch.banReason ? ` · ${ch.banReason}` : ""}
                        </span>
                      ) : (
                        "нет"
                      )}
                    </td>
                    <td>
                      <div className={s.actions}>
                        {ch.subscribed && !ch.banned && (
                          <button
                            type="button"
                            className={s.btn}
                            disabled={rowBusy}
                            onClick={() => void handleDisconnect(ch.channelId)}
                          >
                            Отключить
                          </button>
                        )}
                        {!ch.banned ? (
                          <>
                            <input
                              className={s.banInput}
                              type="text"
                              placeholder="Причина бана (необяз.)"
                              value={banReasons[ch.channelId] ?? ""}
                              disabled={rowBusy}
                              onChange={(e) =>
                                setBanReasons((prev) => ({
                                  ...prev,
                                  [ch.channelId]: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              className={`${s.btn} ${s.btnDanger}`}
                              disabled={rowBusy}
                              onClick={() => void handleBan(ch.channelId)}
                            >
                              Забанить
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className={`${s.btn} ${s.btnWarn}`}
                            disabled={rowBusy}
                            onClick={() => void handleUnban(ch.channelId)}
                          >
                            Разбанить
                          </button>
                        )}
                      </div>
                      {ch.banned && ch.bannedAt ? (
                        <p className={s.muted} style={{ marginTop: "0.25rem" }}>
                          с {formatDate(ch.bannedAt)}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isFetching && data && <p className={s.muted}>Обновление…</p>}
    </div>
  );
}
