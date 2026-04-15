import AddUser from "./_auth.add-bot/addUser";
import type { Route } from "./+types/_auth.channels";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Каналы и бот" },
    { name: "description", content: "Управление подключением и статусом бота на каналах" },
  ];
}

export default function ChannelsRoute() {
  return <AddUser />;
}
