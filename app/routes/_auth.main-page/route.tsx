import type { Route} from "../_auth.main-page/+types/route"

export function meta({}: Route.MetaArgs) {
    return [
        {title: "MainPage"},
        {name: "description", contant: "Главная страница"}
    ]
}

const route = () => {
    return (
        <div>main page</div>
    )
}
export default route