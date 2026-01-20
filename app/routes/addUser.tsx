import { AddUserPage } from "~/pages/addUser/AddUserPage"
import type { Route } from "./+types/addUser";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Добавить юзера" },
    { name: "description", content: "Добро пожаловать!" },
  ];
}
export default function addUser () {
    return <AddUserPage/>

}