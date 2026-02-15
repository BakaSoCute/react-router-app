import { useGetUserQuery, useValidUserQuery } from "~/api/api"
import { useAppSelector } from "~/store/hooks"
import { selectLogin, selectUser, selectIsLoggingOut, selectWasLoggedOut } from "~/features/account/accountSlice"

/**
 * Кастомный хук для работы с авторизацией
 * Объединяет данные из RTK Query и Redux для удобства использования
 */
export const useAuth = () => {
  // Проверяем, идет ли процесс logout
  const isLoggingOut = useAppSelector(selectIsLoggingOut)
  const wasLoggedOut = useAppSelector(selectWasLoggedOut)
  
  // Данные из Redux (синхронизируются через extraReducers)
  const isLogin = useAppSelector(selectLogin)
  const user = useAppSelector(selectUser)
  
  // Блокируем запросы, если:
  // 1. Идет процесс logout
  // 2. Был выполнен logout (чтобы не делать запросы после logout, даже если куки остались)
  // 3. Пользователь разлогинен И мы уже получили ответ от validUser (validData !== undefined)
  // Но делаем запрос, если это первая загрузка (wasLoggedOut === false И validData === undefined)
  const shouldSkipAuthChecks = isLoggingOut || wasLoggedOut
  
  // Проверка валидности сессии
  const { data: validData, isLoading: isValidLoading, isError: isValidError } = useValidUserQuery(undefined, {
    pollingInterval: 15 * 60 * 1000, // Проверка каждые 15 минут
    refetchOnMountOrArgChange: true,
    skip: false, // Блокируем запросы после logout
  })

  // Получение данных пользователя (только если валидация прошла)
  // const shouldSkipGetUser = shouldSkipAuthChecks || (validData !== undefined && validData.isValid === false)
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useGetUserQuery(undefined, {
    skip: false,
    refetchOnMountOrArgChange: false,
  })

  const isLoading = isValidLoading || isUserLoading
  const isError = isValidError || isUserError
  const isValid = validData?.isValid ?? false

  // Приоритет: данные из RTK Query (свежие), если нет - из Redux
  const currentUser = userData?.user ?? user

  return {
    // Состояние авторизации
    isAuthenticated: isValid && isLogin && !!currentUser?.id,
    isValid,
    isLogin,
    isLoading,
    isError,

    // Данные пользователя
    user: currentUser,
    userData: userData?.user ?? null,

    // Сырые данные из API
    validData,
    userDataRaw: userData,
  }
}

/**
 * Упрощенный хук только для проверки авторизации
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated, isLoading } = useAuth()
  return { isAuthenticated, isLoading }
}
