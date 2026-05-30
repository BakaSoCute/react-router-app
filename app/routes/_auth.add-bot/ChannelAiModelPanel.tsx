import { useEffect, useMemo, useState } from "react";
import {
  useGetChannelAiModelQuery,
  usePatchChannelAiModelMutation,
} from "~/api/api";
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

function modelKey(provider: string, model: string): string {
  return `${provider}:${model}`;
}

export function ChannelAiModelPanel({ channelId, subscribed }: Props) {
  const { data, error, isLoading, isError, isFetching } = useGetChannelAiModelQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const [patchModel, patchState] = usePatchChannelAiModelMutation();
  const [draftKey, setDraftKey] = useState("");

  useEffect(() => {
    if (data?.success && data.provider && data.model) {
      setDraftKey(modelKey(data.provider, data.model));
    }
  }, [data?.channelId, data?.provider, data?.model, data?.success]);

  const options = useMemo(() => {
    if (!data?.availableModels?.length) return [];
    return data.availableModels.map((item) => ({
      key: modelKey(item.provider, item.model),
      label: item.label,
      provider: item.provider,
      model: item.model,
      enabled: item.enabled,
      description: item.description,
    }));
  }, [data?.availableModels]);

  const busy = patchState.isLoading || (isFetching && !data);
  const savedKey = data?.success ? modelKey(data.provider, data.model) : "";
  const unchanged = draftKey === savedKey;

  const selectedOption = options.find((o) => o.key === draftKey);
  const providerUnavailable = selectedOption && !selectedOption.enabled;

  const handleSave = async () => {
    if (!channelId || unchanged || busy || !selectedOption) return;
    try {
      await patchModel({
        channelId,
        provider: selectedOption.provider,
        model: selectedOption.model,
      }).unwrap();
    } catch {
      /* RTK Query */
    }
  };

  if (!subscribed) {
    return (
      <section className={s.panel} aria-label="AI-модель">
        <h2 className={s.title}>AI-модель</h2>
        <p className={s.muted}>
          После подключения бота можно выбрать модель для ответов @TsundereChanAI, !baka и связанных функций на этом
          канале.
        </p>
      </section>
    );
  }

  if (isLoading && !data) {
    return (
      <section className={s.panel} aria-busy="true">
        <h2 className={s.title}>AI-модель</h2>
        <p className={s.loading}>Загрузка…</p>
      </section>
    );
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

  return (
    <section className={s.panel} aria-label="AI-модель">
      <h2 className={s.title}>AI-модель</h2>
      <p className={s.lead}>
        Модель для этого канала: ответы через <strong>@TsundereChanAI</strong>, <strong>!baka</strong> и AI-модерация.
        Изменение применяется без перезапуска бота.
        {data.isDefault ? " Сейчас используется модель по умолчанию." : null}
      </p>
      <select
        className={s.select}
        value={draftKey}
        onChange={(e) => setDraftKey(e.target.value)}
        disabled={busy || options.length === 0}
        aria-label="Выбор AI-модели"
      >
        {options.map((opt) => (
          <option key={opt.key} value={opt.key} disabled={!opt.enabled}>
            {opt.label}
            {!opt.enabled ? " (ключ API не настроен на сервере)" : ""}
          </option>
        ))}
      </select>
      {selectedOption?.description ? (
        <p className={s.hint}>{selectedOption.description}</p>
      ) : null}
      {providerUnavailable ? (
        <p className={s.warn} role="status">
          Для этой модели на сервере бота не задан API-ключ провайдера. Выберите другую модель или добавьте ключ на
          Railway.
        </p>
      ) : null}
      <div className={s.metaRow}>
        <p className={s.hint}>
          Текущая: {data.provider} / {data.model}
          {!unchanged ? " · есть несохранённые изменения" : null}
        </p>
        <div className={s.actions}>
          <button
            type="button"
            className={s.save}
            disabled={busy || unchanged || providerUnavailable}
            onClick={() => void handleSave()}
          >
            {patchState.isLoading ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
      {patchState.isSuccess && !patchState.isLoading && unchanged && (
        <p className={s.ok} role="status">
          Сохранено. Следующие ответы бота будут использовать выбранную модель.
        </p>
      )}
      {patchState.isError && (
        <p className={s.err} role="alert">
          {pickFetchError(patchState.error)}
        </p>
      )}
    </section>
  );
}
