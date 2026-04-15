import s from "./css/Login.module.css"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export const Login = () => {
    const handleSubmit = () => {
        // Авторизация происходит автоматически через extraReducers
        // после успешного ответа от бэкенда при редиректе обратно
        const origin = encodeURIComponent(window.location.origin);
        window.location.href = `${BACKEND_URL}/api/auth/twitch?origin=${origin}`
    }
    return (
        <main className={s.main}>
            <section className={s.card}>
              <h1 className={s.title}>Вход в TsundereChanAI</h1>
              <p className={s.text}>
                Авторизуйтесь через Twitch, чтобы подключать бота к каналу, управлять статусом и модерированием.
              </p>
              <button className={s.button} onClick={handleSubmit}>
                Войти через Twitch
              </button>
            </section>
        </main>
    )
}