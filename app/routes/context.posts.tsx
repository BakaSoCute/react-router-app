
import { About } from "~/pages/context/about/About";
import type { Route } from "./+types/context.posts";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Посты" },
    { name: "description", content: "Добро пожаловать!" },
  ];
}
export default function posts () {
    return (
        <div>
            <h1>about page</h1>
            <About />
        </div>
        
    )
}