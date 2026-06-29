import { useEffect } from "react"
import { useGetSessionQuery } from "~/api/api"
import { useAppSelector } from "~/store/hooks"
import { selectLogin, selectUser, selectIsLoggingOut, selectWasLoggedOut } from "~/features/account/accountSlice"
import { perfMark, perfMeasure } from "~/lib/perf"

/**
 * Кастомный хук для работы с авторизацией
 * Объединяет данные из RTK Query и Redux для удобства использования
 */
export const useAuth = () => {
  const isLoggingOut = useAppSelector(selectIsLoggingOut)
  const wasLoggedOut = useAppSelector(selectWasLoggedOut)

  const isLogin = useAppSelector(selectLogin)
  const user = useAppSelector(selectUser)

  const shouldSkipAuthChecks = isLoggingOut || wasLoggedOut

  useEffect(() => {
    if (!shouldSkipAuthChecks) {
      perfMark("auth_bootstrap_start")
    }
  }, [shouldSkipAuthChecks])

  const {
    data: sessionData,
    isLoading: isSessionLoading,
    isFetching: isSessionFetching,
    isError: isSessionError,
  } = useGetSessionQuery(undefined, {
    pollingInterval: 15 * 60 * 1000,
    refetchOnMountOrArgChange: true,
    skip: shouldSkipAuthChecks,
  })

  const isValid = sessionData?.isValid === true
  const sessionUser = sessionData?.user ?? null
  const currentUser = sessionUser ?? user

  useEffect(() => {
    if (sessionUser?.id) {
      perfMark("auth_bootstrap_end")
      perfMeasure("auth_bootstrap", "auth_bootstrap_start", "auth_bootstrap_end")
    }
  }, [sessionUser?.id])

  const isLoading =
    isSessionLoading || (isSessionFetching && !sessionData && !wasLoggedOut)
  const isBootstrapping = isLoading && sessionData === undefined
  const isError = isSessionError

  return {
    isAuthenticated: isValid && isLogin && !!currentUser?.id,
    isValid,
    isLogin,
    isLoading,
    isBootstrapping,
    isError,

    user: currentUser,
    userData: sessionUser,

    validData: sessionData ? { isValid: sessionData.isValid } : undefined,
    userDataRaw: sessionData?.user
      ? { success: true, user: sessionData.user, timestamp: sessionData.timestamp }
      : undefined,
    sessionData,
  }
}

/**
 * Упрощенный хук только для проверки авторизации
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated, isLoading } = useAuth()
  return { isAuthenticated, isLoading }
}
