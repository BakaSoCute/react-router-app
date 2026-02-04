import type { Route } from "./+types/_index";
import { Counter } from "~/features/counter/Counter";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Главная страница" },
    { name: "description", content: "Добро пожаловать!" },
  ];
}

export default function mainPage() {
  return <Counter />;
}
