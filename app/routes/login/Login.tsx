import s from "./css/Login.module.css"
import { login, logout } from "~/features/account/accountSlice"
import { useAppDispatch } from "~/store/hooks"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export const Login = () => {
    const dispatch = useAppDispatch()
    const handleSubmit = () => {
        dispatch(login())
        window.location.href = `${BACKEND_URL}/api/auth/twitch`
    }
    return (
        <main className={s.main}>
            <h1>Войти в аккаунт</h1>
            <button onClick={handleSubmit}>Войти через Twich</button>
        </main>
    )
}