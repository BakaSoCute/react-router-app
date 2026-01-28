import s from "./css/Login.module.css"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
export const Login = () => {
    const handleSubmit = () => {
        window.location.href = `${BACKEND_URL}/api/auth/twitch`
    }
    return (
        <main className={s.main}>
            <h1>Войти в аккаунт</h1>
            <button onClick={handleSubmit}>Войти через Twich</button>
        </main>
    )
}