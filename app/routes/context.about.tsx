
import { About } from "~/pages/context/about/About";
import type { Route } from "./+types/context.about";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Добавить юзера" },
    { name: "description", content: "Добро пожаловать!" },
  ];
}
export default function about () {
    return (
        <div>
            <h1>about page</h1>
            <About />
        </div>
        
    )
}