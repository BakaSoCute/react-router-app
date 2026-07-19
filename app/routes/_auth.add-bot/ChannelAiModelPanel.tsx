import { useGetChannelAiModelQuery } from "~/api";
import { PanelSkeleton } from "~/components/dashboard/PanelSkeleton";
import s from "./ChannelAiModelPanel.module.css";

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
  return "Не удалось загрузить настройки модели";
}

/**
 * Read-only: model is fixed via server env (AI_DEFAULT_PROVIDER / AI_DEFAULT_MODEL).
 * Channel-level changes are disabled on BY VPS (DeepSeek-only).
 */
export function ChannelAiModelPanel({ channelId, subscribed }: Props) {
  const { data, error, isLoading, isError } = useGetChannelAiModelQuery(channelId, {
    skip: !channelId || !subscribed,
  });

  if (!subscribed) {
    return (
      <section className={s.panel} aria-label="AI-модель">
        <h2 className={s.title}>AI-модель</h2>
        <p className={s.muted}>Подключите бота, чтобы увидеть модель, заданную на сервере.</p>
      </section>
    );
  }

  if (isLoading && !data) {
    return <PanelSkeleton title="AI-модель" rows={2} />;
  }

  if (isError || !data?.success) {
    return (
      <section className={s.panel}>
        <h2 className={s.title}>AI-модель</h2>
        <p className={s.err} role="alert">
          {pickFetchError(error)}
        </p>
      </section>
    );
  }

  const catalogLabel =
    data.availableModels?.find((m) => m.provider === data.provider && m.model === data.model)?.label ??
    `${data.provider} / ${data.model}`;

  return (
    <section className={s.panel} aria-label="AI-модель">
      <h2 className={s.title}>AI-модель</h2>
      <p className={s.lead}>
        Модель задаётся на сервере и не меняется из панели (ограничение площадки / единый DeepSeek).
      </p>
      <p className={s.hint}>
        Текущая: <strong>{catalogLabel}</strong>
        {data.isDefault ? " · значение по умолчанию" : null}
      </p>
      <p className={s.hint}>
        {data.provider} / {data.model}
      </p>
    </section>
  );
}
