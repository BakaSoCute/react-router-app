import { useGetBotChannelStatusQuery } from "~/api";
import { PanelSkeleton } from "~/components/dashboard/PanelSkeleton";
import { useAdaptivePolling } from "~/hooks/useAdaptivePolling";
import { useChannelStatusStream } from "~/hooks/useChannelStatusStream";
import { pickApiErrorMessage } from "~/lib/api-error-message";
import s from "./BotStatusPanel.module.css";

type Props = {
  channelId: string;
  /** Poll only when overview tab is active (default true). */
  pollActive?: boolean;
};

export function BotStatusPanel({ channelId, pollActive = true }: Props) {
  const { isStreamOpen } = useChannelStatusStream(channelId, { enabled: pollActive });
  const pollingInterval = useAdaptivePolling(pollActive && !isStreamOpen);

  const { data, error, isLoading, isFetching, isError, refetch } = useGetBotChannelStatusQuery(
    channelId,
    {
      skip: !channelId,
      pollingInterval,
      skipPollingIfUnfocused: true,
    }
  );

  if (isLoading && !data) {
    return <PanelSkeleton title="Статус бота" rows={3} />;
  }

  if (isError || !data) {
    return (
      <section className={s.panel}>
        <h2 className={s.panelTitle}>Статус бота</h2>
        <p className={s.errorBox} role="alert">
          {pickApiErrorMessage(error, "Не удалось загрузить статус бота")}
        </p>
        <p className={s.meta}>
          Пока статус недоступен, подключение и отключение бота временно скрыты.
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
      </div>

      <p className={s.polling}>
        {isStreamOpen
          ? "Обновление в реальном времени"
          : isFetching && !isLoading
            ? "Обновление…"
            : "Автообновление включено"}
        {botAnswering ? " · бот может отвечать в чате" : ""}
      </p>
    </section>
  );
}
