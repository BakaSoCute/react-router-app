import type { Route } from "./+types/route";
import { Login } from "./Login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Войти в аккаунт" },
    { name: "description", content: "Добро пожаловать!" },
  ];
}

export default function route  () {
    return <Login />
}

