import s from "./css/Login.module.css"

export const Login = () => {
    const handleSubmit = () => {
        
    }
    return (
        <main className={s.main}>
            <h1>Войти в аккаунт</h1>
            <button onClick={handleSubmit}>Войти через Twich</button>
        </main>
    )
}