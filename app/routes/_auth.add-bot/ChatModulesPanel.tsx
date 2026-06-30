import { useState } from "react";
import { useGetChatModulesQuery, usePatchChatModuleMutation } from "~/api";
import { PanelSkeleton } from "~/components/dashboard/PanelSkeleton";
import s from "./ChatModulesPanel.module.css";

type Props = {
  channelId: string;
  /** Модули настраиваются только пока канал подписан на бот-сервер */
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
  return "Не удалось загрузить модули";
}

export function ChatModulesPanel({ channelId, subscribed }: Props) {
  const { data, error, isLoading, isError } = useGetChatModulesQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const [patchModule] = usePatchChatModuleMutation();
  const [patchingModuleId, setPatchingModuleId] = useState<string | null>(null);

  if (!subscribed) {
    return (
      <section className={s.panel} aria-label="Модули чата">
        <h2 className={s.title}>Модули чата</h2>
        <p className={s.muted}>
          После подключения бота к каналу здесь можно включать и отключать интерактивные функции по отдельности.
        </p>
      </section>
    );
  }

  if (isLoading && !data) {
    return <PanelSkeleton title="Модули чата" rows={4} />;
  }

  if (isError || !data?.success) {
    return (
      <section className={s.panel}>
        <h2 className={s.title}>Модули чата</h2>
        <p className={s.err} role="alert">
          {pickFetchError(error)}
        </p>
      </section>
    );
  }

  return (
    <section className={s.panel} aria-label="Модули чата">
      <h2 className={s.title}>Модули чата</h2>
      <p className={s.lead}>
        Включайте и отключайте интерактив по каналу. Управление командами <code className={s.code}>!baka on</code> /{" "}
        <code className={s.code}>!baka off</code> и <code className={s.code}>!timer</code> остаются в чате и не зависят от этих переключателей.
      </p>
      <div className={s.list}>
        {data.modules.map((mod) => {
          const rowBusy = patchingModuleId === mod.id;
          return (
            <div key={mod.id} className={s.row}>
              <div className={s.meta}>
                <p className={s.moduleTitle}>{mod.title}</p>
                <p className={s.desc}>{mod.description}</p>
              </div>
              <button
                type="button"
                className={`${s.toggle} ${mod.enabled ? s.toggleOn : s.toggleOff}`}
                disabled={patchingModuleId !== null}
                aria-pressed={mod.enabled}
                onClick={() => {
                  setPatchingModuleId(mod.id);
                  void patchModule({
                    channelId,
                    moduleId: mod.id,
                    enabled: !mod.enabled,
                  })
                    .unwrap()
                    .finally(() => setPatchingModuleId(null));
                }}
              >
                {rowBusy ? "…" : mod.enabled ? "Вкл." : "Выкл."}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
