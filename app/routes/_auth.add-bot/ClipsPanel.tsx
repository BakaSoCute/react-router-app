import { useEffect, useState } from "react";
import {
  type CustomCommandUserLevel,
  useGetClipsSettingsQuery,
  usePatchClipsSettingsMutation,
} from "~/api";
import { PanelSkeleton } from "~/components/dashboard/PanelSkeleton";
import s from "./TimersPanel.module.css";

type Props = {
  channelId: string;
  subscribed: boolean;
};

const USER_LEVEL_OPTIONS: { value: CustomCommandUserLevel; label: string }[] = [
  { value: "everyone", label: "Любой зритель" },
  { value: "vip", label: "VIP и выше" },
  { value: "mod", label: "Модераторы и выше" },
  { value: "broadcaster", label: "Только стример" },
];

const PATCH_ERROR_LABELS: Record<string, string> = {
  invalid_user_level: "Некорректный уровень доступа.",
  invalid_cooldown: "Кулдаун должен быть от 0 до 300 секунд.",
  nothing_to_update: "Нечего обновлять.",
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

export function ClipsPanel({ channelId, subscribed }: Props) {
  const { data, error, isLoading, isFetching } = useGetClipsSettingsQuery(channelId, {
    skip: !channelId || !subscribed,
  });
  const [patchSettings, patchState] = usePatchClipsSettingsMutation();

  const [invokeLevel, setInvokeLevel] = useState<CustomCommandUserLevel>("everyone");
  const [cooldown, setCooldown] = useState("30");
  const [patchErr, setPatchErr] = useState<string | null>(null);

  useEffect(() => {
    if (data?.invokeUserLevel) setInvokeLevel(data.invokeUserLevel);
    if (typeof data?.cooldownSeconds === "number") setCooldown(String(data.cooldownSeconds));
  }, [data?.invokeUserLevel, data?.cooldownSeconds]);

  if (!subscribed) {
    return null;
  }

  if (isLoading && !data) {
    return <PanelSkeleton title="Клипы (!clip)" rows={3} />;
  }

  const busy = patchState.isLoading || (isFetching && !data);

  async function handleInvokeLevelChange(level: CustomCommandUserLevel) {
    setPatchErr(null);
    setInvokeLevel(level);
    try {
      await patchSettings({ channelId, userLevel: level }).unwrap();
    } catch (e) {
      setPatchErr(pickFetchError(e));
    }
  }

  async function handleCooldownBlur() {
    const parsed = Number.parseInt(cooldown, 10);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 300) {
      setPatchErr("Кулдаун: целое число от 0 до 300 секунд.");
      return;
    }
    if (data && parsed === data.cooldownSeconds) return;
    setPatchErr(null);
    try {
      await patchSettings({ channelId, cooldownSeconds: parsed }).unwrap();
    } catch (e) {
      setPatchErr(pickFetchError(e));
    }
  }

  return (
    <section className={s.panel}>
      <h2 className={s.title}>Клипы (!clip)</h2>
      <p className={s.lead}>
        В чате во время стрима: <code className={s.code}>!clip</code> — клип 30 сек. с ником зрителя;{" "}
        <code className={s.code}>!clip 45</code> — ник и 45 сек.;{" "}
        <code className={s.code}>!clip название</code> — своё название, 30 сек.;{" "}
        <code className={s.code}>!clip название 45</code> — название и длительность (5–60 сек.). Модуль можно
        выключить в блоке «Модули чата».
      </p>

      {isLoading && <p className={s.lead}>Загрузка настроек…</p>}
      {error && <p className={s.errorBox}>Не удалось загрузить настройки клипов.</p>}

      <h3 className={s.sectionTitle}>Кто может вызывать !clip</h3>
      <div className={s.form}>
        <div className={s.field}>
          <label className={s.label} htmlFor="clip-invoke-level">
            Минимальная роль в чате
          </label>
          <select
            id="clip-invoke-level"
            className={s.select}
            value={invokeLevel}
            disabled={busy || isLoading}
            onChange={(e) => void handleInvokeLevelChange(e.target.value as CustomCommandUserLevel)}
          >
            {USER_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <label className={s.label} htmlFor="clip-cooldown">
            Кулдаун на зрителя (сек., 0–300)
          </label>
          <input
            id="clip-cooldown"
            className={s.input}
            type="number"
            min={0}
            max={300}
            value={cooldown}
            disabled={busy || isLoading}
            onChange={(e) => setCooldown(e.target.value)}
            onBlur={() => void handleCooldownBlur()}
          />
        </div>
      </div>

      {patchErr && <p className={s.errorBox}>{patchErr}</p>}
    </section>
  );
}
