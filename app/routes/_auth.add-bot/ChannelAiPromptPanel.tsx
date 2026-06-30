import { useEffect, useRef, useState } from "react";
import {
  CHANNEL_AI_PROMPT_MAX_CHARS,
  useGetChannelAiPromptQuery,
  usePatchChannelAiPromptMutation,
} from "~/api";
import { PanelSkeleton } from "~/components/dashboard/PanelSkeleton";
import { useDebouncedValue } from "~/hooks/useDebouncedValue";
import s from "./ChannelAiPromptPanel.module.css";

type Props = {
  channelId: string;
  subscribed: boolean;
};

type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

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
  const { data, error, isLoading, isError } = useGetChannelAiPromptQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const [patchPrompt, patchState] = usePatchChannelAiPromptMutation();
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const lastSavedRef = useRef("");

  useEffect(() => {
    if (data?.success && typeof data.prompt === "string") {
      setDraft(data.prompt);
      lastSavedRef.current = data.prompt;
      setSaveState("idle");
    }
  }, [data?.channelId, data?.prompt, data?.success]);

  const debouncedDraft = useDebouncedValue(draft, 600);
  const savedPrompt = data?.success ? (data.prompt ?? "") : "";

  useEffect(() => {
    if (!channelId || !data?.success) return;
    if (debouncedDraft === lastSavedRef.current) {
      setSaveState((prev) => (prev === "pending" ? "idle" : prev));
      return;
    }

    let cancelled = false;
    setSaveState("saving");

    void patchPrompt({ channelId, prompt: debouncedDraft })
      .unwrap()
      .then(() => {
        if (cancelled) return;
        lastSavedRef.current = debouncedDraft;
        setSaveState("saved");
      })
      .catch(() => {
        if (cancelled) return;
        setSaveState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedDraft, channelId, data?.success, patchPrompt]);

  useEffect(() => {
    if (draft !== debouncedDraft && draft !== lastSavedRef.current) {
      setSaveState("pending");
    }
  }, [draft, debouncedDraft]);

  if (!subscribed) {
    return (
      <section className={s.panel} aria-label="Промт для ИИ">
        <h2 className={s.title}>Дополнительный промт для бота</h2>
        <p className={s.muted}>
          После подключения бота к каналу здесь можно задать дополнительные правила поведения для этого канала (они
          добавляются к базовому промту бота). Влияет только на ответы через @TsundereChanAI
        </p>
      </section>
    );
  }

  if (isLoading && !data) {
    return <PanelSkeleton title="Дополнительный промт для бота" rows={6} />;
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

  const statusLabel =
    saveState === "pending"
      ? "Изменения…"
      : saveState === "saving"
        ? "Сохранение…"
        : saveState === "saved"
          ? "Сохранено"
          : saveState === "error"
            ? "Ошибка сохранения"
            : null;

  return (
    <section className={s.panel} aria-label="Промт для ИИ">
      <h2 className={s.title}>Дополнительный промт для бота</h2>
      <p className={s.lead}>
        Текст ниже добавляется к настройкам бота <strong>только для выбранного канала</strong> и действует без
        перезапуска бота. Это не замена базовому характеру и правилам Twitch — формулируйте дополнительный тон, темы
        стрима, табу-слова и т.п. Оставьте поле пустым — автосохранение сбросит промт. Влияет только на ответы через
        @TsundereChanAI
      </p>
      <textarea
        className={s.textarea}
        value={draft}
        maxLength={CHANNEL_AI_PROMPT_MAX_CHARS}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck
        aria-label="Дополнительный промт канала"
      />
      <div className={s.metaRow}>
        <p className={s.counter}>
          {draft.length} / {CHANNEL_AI_PROMPT_MAX_CHARS}
          {statusLabel ? ` · ${statusLabel}` : null}
        </p>
      </div>
      {saveState === "error" && patchState.error ? (
        <p className={s.err} role="alert">
          {pickFetchError(patchState.error)}
        </p>
      ) : null}
      {saveState === "saved" && draft === savedPrompt ? (
        <p className={s.ok} role="status">
          Следующие ответы бота уже учитывают этот текст.
        </p>
      ) : null}
    </section>
  );
}
