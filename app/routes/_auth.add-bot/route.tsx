import { Navigate } from "react-router";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Перенаправление" },
    { name: "description", content: "Переход на новую страницу каналов" },
  ];
}

export default function LegacyAddBotRoute() {
  return <Navigate to="/channels" replace />;
}
