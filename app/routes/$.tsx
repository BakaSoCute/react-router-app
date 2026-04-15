import { Link } from "react-router";

export default function pageNotFound() {
  return (
    <main
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <h1>Страница не найдена</h1>
      <p>Проверьте адрес или вернитесь на главную.</p>
      <Link to="/">Вернуться на главную</Link>
    </main>
  );
}