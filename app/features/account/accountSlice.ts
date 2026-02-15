import { createSlice } from "@reduxjs/toolkit"
import { api } from "~/api/api"

interface AccountSetings {
    isLogin: boolean,
    isLoggingOut: boolean, // Флаг для блокировки запросов во время logout
    wasLoggedOut: boolean, // Флаг для отслеживания, был ли выполнен logout (чтобы не делать запросы после logout)
    user: {
        id: string | null,
        login: string | null,
        display_name?: string | undefined,
        email: string | null,
        description: string | null,
        profile_image_url?: string | undefined,
        created_at: string | null,
        broadcaster_type: string | null,
        view_count: number | null
    }
}

const initialState: AccountSetings = {
    isLogin: false,
    isLoggingOut: false,
    wasLoggedOut: false,
    user: {
        id: null,
        login: null,
        display_name: "",
        email: null,
        description: null,
        profile_image_url: "",
        created_at: null,
        broadcaster_type: null,
        view_count: null
    }
}

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        setLoggingOut: (state, action: { payload: boolean }) => {
            state.isLoggingOut = action.payload
        },
        logout: (state) => {
            state.isLogin = false
            state.isLoggingOut = false
            state.wasLoggedOut = true // Устанавливаем флаг, что был выполнен logout
            state.user = {
                id: null,
                login: null,
                display_name: "",
                email: null,
                description: null,
                profile_image_url: "",
                created_at: null,
                broadcaster_type: null,
                view_count: null
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Синхронизация с getUser endpoint
            .addMatcher(
                api.endpoints.getUser.matchFulfilled,
                (state, action) => {
                    state.user = action.payload.user
                    state.isLogin = true
                    state.wasLoggedOut = false // Сбрасываем флаг при успешной авторизации
                }
            )
            .addMatcher(
                api.endpoints.getUser.matchRejected,
                (state) => {
                    state.isLogin = false
                    state.user = {
                        id: null,
                        login: null,
                        display_name: "",
                        email: null,
                        description: null,
                        profile_image_url: "",
                        created_at: null,
                        broadcaster_type: null,
                        view_count: null
                    }
                }
            )
            // Синхронизация с validUser endpoint
            .addMatcher(
                api.endpoints.validUser.matchFulfilled,
                (state, action) => {
                    // Если валидация не прошла, сбрасываем состояние
                    if (!action.payload.isValid) {
                        state.isLogin = false
                        state.user = {
                            id: null,
                            login: null,
                            display_name: "",
                            email: null,
                            description: null,
                            profile_image_url: "",
                            created_at: null,
                            broadcaster_type: null,
                            view_count: null
                        }
                    }
                }
            )
            .addMatcher(
                api.endpoints.validUser.matchRejected,
                (state) => {
                    state.isLogin = false
                    state.user = {
                        id: null,
                        login: null,
                        display_name: "",
                        email: null,
                        description: null,
                        profile_image_url: "",
                        created_at: null,
                        broadcaster_type: null,
                        view_count: null
                    }
                }
            )
            // Синхронизация с logout endpoint
            .addMatcher(
                api.endpoints.logout.matchFulfilled,
                (state) => {
                    state.isLogin = false
                    state.isLoggingOut = false
                    state.wasLoggedOut = true
                    state.user = {
                        id: null,
                        login: null,
                        display_name: "",
                        email: null,
                        description: null,
                        profile_image_url: "",
                        created_at: null,
                        broadcaster_type: null,
                        view_count: null
                    }
                }
            )
            .addMatcher(
                api.endpoints.logout.matchRejected,
                (state) => {
                    // Даже если logout не удался на бэкенде, очищаем локальное состояние
                    state.isLogin = false
                    state.isLoggingOut = false
                    state.wasLoggedOut = true
                    state.user = {
                        id: null,
                        login: null,
                        display_name: "",
                        email: null,
                        description: null,
                        profile_image_url: "",
                        created_at: null,
                        broadcaster_type: null,
                        view_count: null
                    }
                }
            )
    }
})
export const { logout, setLoggingOut } = accountSlice.actions
export const selectLogin = (state: { account: AccountSetings }) => state.account.isLogin
export const selectUser = (state: { account: AccountSetings }) => state.account.user
export const selectIsLoggingOut = (state: { account: AccountSetings }) => state.account.isLoggingOut
export const selectWasLoggedOut = (state: { account: AccountSetings }) => state.account.wasLoggedOut

export default accountSlice.reducer