import { useEffect, useState } from "react";
import {
  CHANNEL_AI_PROMPT_MAX_CHARS,
  useGetChannelAiPromptQuery,
  usePatchChannelAiPromptMutation,
} from "~/api/api";
import s from "./ChannelAiPromptPanel.module.css";

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
  return "Не удалось загрузить промт";
}

export function ChannelAiPromptPanel({ channelId, subscribed }: Props) {
  const { data, error, isLoading, isError, isFetching } = useGetChannelAiPromptQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const [patchPrompt, patchState] = usePatchChannelAiPromptMutation();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (data?.success && typeof data.prompt === "string") {
      setDraft(data.prompt);
    }
  }, [data?.channelId, data?.prompt, data?.success]);

  const busy = patchState.isLoading || (isFetching && !data);
  const savedPrompt = data?.success ? data.prompt ?? "" : "";
  const unchanged = draft === savedPrompt;

  const handleSave = async () => {
    if (!channelId || unchanged || busy) return;
    try {
      await patchPrompt({ channelId, prompt: draft }).unwrap();
    } catch {
      /* RTK Query */
    }
  };

  if (!subscribed) {
    return (
      <section className={s.panel} aria-label="Промт для ИИ">
        <h2 className={s.title}>Дополнительный промт для бота</h2>
        <p className={s.muted}>
          После подключения бота к каналу здесь можно задать дополнительные правила поведения для этого канала (они
          добавляются к базовому промту бота).
        </p>
      </section>
    );
  }

  if (isLoading && !data) {
    return (
      <section className={s.panel} aria-busy="true">
        <h2 className={s.title}>Дополнительный промт для бота</h2>
        <p className={s.loading}>Загрузка…</p>
      </section>
    );
  }

  if (isError || !data?.success) {
    return (
      <section className={s.panel}>
        <h2 className={s.title}>Дополнительный промт для бота</h2>
        <p className={s.err} role="alert">
          {pickFetchError(error)}
        </p>
      </section>
    );
  }

  return (
    <section className={s.panel} aria-label="Промт для ИИ">
      <h2 className={s.title}>Дополнительный промт для бота</h2>
      <p className={s.lead}>
        Текст ниже добавляется к настройкам бота <strong>только для выбранного канала</strong> и действует без
        перезапуска бота. Это не замена базовому характеру и правилам Twitch — формулируйте дополнительный тон, темы
        стрима, табу-слова и т.п. Оставьте поле пустым и сохраните, чтобы сбросить.
      </p>
      <textarea
        className={s.textarea}
        value={draft}
        maxLength={CHANNEL_AI_PROMPT_MAX_CHARS}
        onChange={(e) => setDraft(e.target.value)}
        disabled={busy}
        spellCheck
        aria-label="Дополнительный промт канала"
      />
      <div className={s.metaRow}>
        <p className={s.counter}>
          {draft.length} / {CHANNEL_AI_PROMPT_MAX_CHARS}
          {!unchanged ? " · есть несохранённые изменения" : null}
        </p>
        <div className={s.actions}>
          <button
            type="button"
            className={s.save}
            disabled={busy || unchanged}
            onClick={() => void handleSave()}
          >
            {patchState.isLoading ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
      {patchState.isSuccess && !patchState.isLoading && unchanged && (
        <p className={s.ok} role="status">
          Сохранено. Следующие ответы бота уже учитывают этот текст.
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
