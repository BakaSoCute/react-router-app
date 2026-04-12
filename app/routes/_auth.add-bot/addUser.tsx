import { useAddBotToChannelMutation, useGetUserQuery, useRemoveBotFromChannelMutation } from "~/api/api";
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
  const user = userPayload?.user;

  const [addBot, addState] = useAddBotToChannelMutation();
  const [removeBot, removeState] = useRemoveBotFromChannelMutation();

  const handleAdd = async () => {
    removeState.reset();
    try {
      await addBot({}).unwrap();
    } catch {
      /* RTK Query */
    }
  };

  const handleRemove = async () => {
    addState.reset();
    try {
      await removeBot({}).unwrap();
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
        Вы вошли как <strong>{user.display_name}</strong> (@{user.login}). Канал:{" "}
        <code className={s.code}>{user.id}</code>. Для кнопок ниже нужен scope{" "}
        <code className={s.code}>channel:manage:moderators</code>.
      </p>

      <BotStatusPanel channelId={user.id} />

      <div className={s.card}>
        <h2 className={s.cardTitle}>Подключение</h2>
        <div className={s.actions}>
          <button
            type="button"
            className={s.buttonPrimary}
            disabled={addState.isLoading || removeState.isLoading}
            onClick={() => void handleAdd()}
          >
            {addState.isLoading ? "Подключение…" : "Подключить бота и выдать модератора"}
          </button>
          <button
            type="button"
            className={s.buttonDanger}
            disabled={addState.isLoading || removeState.isLoading}
            onClick={() => void handleRemove()}
          >
            {removeState.isLoading ? "Отключение…" : "Отключить бота и снять модератора"}
          </button>
        </div>

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
      </div>
    </div>
  );
}
