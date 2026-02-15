import type { Route } from "../_auth.main-page/+types/route"
import s from "./main-page.module.css"
import { useAuth } from "~/hooks/useAuth"

export function meta({}: Route.MetaArgs) {
    return [
        {title: "MainPage"},
        {name: "description", content: "Главная страница"}
    ]
}

const route = () => {
    const { user, isLoading } = useAuth()

    if (isLoading || !user?.id) {
        return <div>Загрузка...</div>
    }
    return (
        <div>
            <h1>Main Page</h1>
            <div className={s.profile}>
                <img src={user.profile_image_url} alt={user.display_name} />
                <p>Id:{user.id}</p>
                <p>Login:{user.login}</p>
                <p>Name:{user.display_name}</p>
                <p>Email:{user.email}</p>
            </div>
        </div>
    )
}
export default route