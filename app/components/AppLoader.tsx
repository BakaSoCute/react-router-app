import s from "./AppLoader.module.css";

type Props = {
  message?: string;
};

export function AppLoader({ message = "Загрузка…" }: Props) {
  return (
    <div className={s.wrap} role="status" aria-live="polite" aria-label={message}>
      <span className={s.spinner} aria-hidden="true" />
      <p className={s.message}>{message}</p>
    </div>
  );
}
