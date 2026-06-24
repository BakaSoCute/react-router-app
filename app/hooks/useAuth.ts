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
    skip: shouldSkipAuthChecks,
  })

  const isValid = validData?.isValid === true
  const shouldFetchUser = !shouldSkipAuthChecks && isValid

  // Данные пользователя — только после успешной валидации сессии
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useGetUserQuery(undefined, {
    skip: !shouldFetchUser,
    refetchOnMountOrArgChange: false,
  })

  // Приоритет: данные из RTK Query (свежие), если нет - из Redux
  const currentUser = userData?.user ?? user

  const isLoading =
    isValidLoading || (shouldFetchUser && isUserLoading && !currentUser?.id)
  const isError = isValidError || (shouldFetchUser && isUserError)

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
