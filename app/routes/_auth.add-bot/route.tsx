import  AddUser  from "./addUser"
import type { Route } from "./+types/route"
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Добавить бота" },
    { name: "description", content: "Страница добавления бота в чат" },
  ];
}
export default function () {
    return (
        <AddUser />
    )
} 
