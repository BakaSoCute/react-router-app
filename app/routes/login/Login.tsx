import s from "./css/Login.module.css"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export const Login = () => {
    const handleSubmit = () => {
        // Авторизация происходит автоматически через extraReducers
        // после успешного ответа от бэкенда при редиректе обратно
        //const origin = encodeURIComponent(window.location.origin);
        const origin = "https://app.aleksandromelucik.ru"
        window.location.href = `${BACKEND_URL}/api/auth/twitch?origin=${origin}`
    }
    return (
        <main className={s.main}>
            <h1>Войти в аккаунт</h1>
            <button onClick={handleSubmit}>Войти через Twitch</button>
        </main>
    )
}