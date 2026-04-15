import type { Route } from "./+types/_index";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Главная страница" },
    { name: "description", content: "Добро пожаловать!" },
  ];
}

export default function mainPage() {
  return <div>MainPage</div>;
}
