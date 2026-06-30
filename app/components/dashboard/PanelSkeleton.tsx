import s from "./PanelSkeleton.module.css";

type Props = {
  title: string;
  rows?: number;
};

export function PanelSkeleton({ title, rows = 4 }: Props) {
  return (
    <section className={s.panel} aria-busy="true" aria-label={title}>
      <h2 className={s.title}>{title}</h2>
      <div className={s.stack}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={s.row} style={{ width: i === rows - 1 ? "60%" : "100%" }} />
        ))}
      </div>
    </section>
  );
}
