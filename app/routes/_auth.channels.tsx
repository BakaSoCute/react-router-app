import { lazy, Suspense } from "react";
import type { Route } from "./+types/_auth.channels";

const AddUser = lazy(() => import("./_auth.add-bot/addUser"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Каналы и бот" },
    { name: "description", content: "Управление подключением и статусом бота на каналах" },
  ];
}

export default function ChannelsRoute() {
  return (
    <Suspense fallback={null}>
      <AddUser />
    </Suspense>
  );
}
