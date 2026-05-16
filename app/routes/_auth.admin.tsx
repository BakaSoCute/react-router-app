import { AdminChannelsPage } from "./_auth.admin/AdminChannelsPage";
import type { Route } from "./+types/_auth.admin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Админ-панель" },
    { name: "description", content: "Управление подключёнными каналами бота" },
  ];
}

export default function AdminRoute() {
  return <AdminChannelsPage />;
}
