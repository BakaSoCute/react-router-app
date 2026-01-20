import type { Route } from "./+types/_index";
import { Welcome } from "../pages/welcome/welcome";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Главная страница" },
    { name: "description", content: "Добро пожаловать!" },
  ];
}

export default function mainPage() {
  return <Welcome />;
}
