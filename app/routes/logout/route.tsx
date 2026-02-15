import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch } from "~/store/hooks"
import { logout, setLoggingOut } from "~/features/account/accountSlice"
import { api, useLogoutMutation } from "~/api/api"

export default function LogoutRoute() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [logoutMutation, { isLoading }] = useLogoutMutation()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Устанавливаем флаг, чтобы блокировать запросы useAuth
        dispatch(setLoggingOut(true))
        
        // Вызываем API для очистки сессии на бэкенде (удаление кук)
        try {
          await logoutMutation().unwrap()
        } catch (apiError) {
          // Если бэкенд не поддерживает logout endpoint, продолжаем с очисткой локального состояния
          console.warn("Logout endpoint недоступен или вернул ошибку:", apiError)
        }
        
        // Очищаем состояние авторизации в Redux (включая isLoggingOut)
        dispatch(logout())
        
        // Инвалидируем кэш RTK Query (очищает все кэшированные данные)
        dispatch(api.util.resetApiState())
        
        // Небольшая задержка перед редиректом, чтобы дать время очистить состояние
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Перенаправляем на главную страницу
        navigate("/", { replace: true })
      } catch (error) {
        // Даже если что-то пошло не так, очищаем локальное состояние
        console.error("Ошибка при выходе:", error)
        dispatch(logout())
        dispatch(api.util.resetApiState())
        navigate("/", { replace: true })
      }
    }

    performLogout()
  }, [dispatch, navigate, logoutMutation])

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Выход из системы...</p>
      {isLoading && <p style={{ fontSize: "0.9em", color: "#666" }}>Очистка сессии...</p>}
    </div>
  )
}
