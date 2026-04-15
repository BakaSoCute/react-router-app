import { Navigate } from "react-router";
import type { Route } from "../_auth.main-page/+types/route";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Перенаправление" },
        { name: "description", content: "Переход на новую страницу профиля" }
    ];
}

export default function LegacyMainPageRoute() {
    return <Navigate to="/profile" replace />;
}