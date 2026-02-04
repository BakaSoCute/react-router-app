import { useGetUserQuery } from "~/api/api"
import type { Route} from "../_auth.main-page/+types/route"
import s from "./main-page.module.css"

export function meta({}: Route.MetaArgs) {
    return [
        {title: "MainPage"},
        {name: "description", content: "Главная страница"}
    ]
}


const route = () => {
    const { data: user = null } = useGetUserQuery(undefined,{
        pollingInterval: Infinity,
        skip:false,
        refetchOnMountOrArgChange: false
      })
    console.log(user)
    if (!user) {
        return <div>Loading...</div>
    }
    return (
        <div>
            <h1>Main Page</h1>
            <div className={s.profile}>
                <img src={user.user.profile_image_url} alt={user.user.display_name} />
                <p>Id:{user.user.id}</p>
                <p>Login:{user.user.login}</p>
                <p>Name:{user.user.display_name}</p>
                <p>Email:{user.user.email}</p>
            </div>
        </div>
    )
}
export default route