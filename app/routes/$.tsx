import { Link } from "react-router";
import { Mascot } from "~/components/Mascot";
import s from "~/styles/not-found.module.css";

export default function pageNotFound() {
  return (
    <main className={s.wrap}>
      {/* <Mascot size="sm" /> */}
      <h1 className={s.title}>404 — страница не найдена</h1>
      <p className={s.text}>Проверьте адрес или вернитесь на главную.</p>
      <Link to="/" className={s.link}>
        На главную
      </Link>
    </main>
  );
}
