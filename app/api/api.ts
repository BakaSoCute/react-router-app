import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


type User = {
    success: boolean,
    user: {
        id: string,
        login: string,
        display_name: string,
        email: string,
        description: string,
        profile_image_url: string,
        created_at: string,
        broadcaster_type: string,
        view_count: number
    },
    timestamp: string
}
type Valid = {
    isValid: boolean
}
type Refresh = {
    status: string
}
type LogoutResponse = {
    success: boolean
    message?: string
}

type AddBotResponse = {
    success: boolean
    message?: string
    channelId?: string
    login?: string
    railway?: { ok?: boolean; skipped?: boolean; error?: string; data?: unknown }
    moderator?: { ok?: boolean; error?: string }
    rollback?: { ok: true } | { ok: false; error: string }
}

type RemoveBotResponse = {
    success: boolean
    message?: string
    channelId?: string
    login?: string
    railway?: { ok?: boolean; skipped?: boolean; notRegistered?: boolean; error?: string; data?: unknown }
    moderator?: { ok?: boolean; error?: string }
}

export type BotChannelStatus = {
    channelId: string
    subscribed: boolean
    eventsubConnected: boolean
    streamLive: boolean
    botEnabled: boolean
    timer: {
        active: boolean
        remainingMs?: number
        totalMinutes?: number
        endsAt?: number
    }
}

export type ManagedChannel = {
    id: string
    login: string
    name: string
    source: "self" | "moderated"
    /** Для чужих каналов: обычный модератор или ведущий (если бэкенд смог определить по ответу Twitch). */
    moderatorRole?: "moderator" | "lead_moderator"
}

type ManagedChannelsResponse = {
    success: boolean
    user: {
        id: string
        login: string
    }
    channels: ManagedChannel[]
}



export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ 
        baseUrl: import.meta.env.VITE_BACKEND_URL,
        credentials: 'include'
    }),
    tagTypes: ["User","Valid","Refresh","Auth","BotStatus"],
    endpoints: (builder) => ({
        getUser: builder.query<User, void>({
            query: () => '/api/auth/twitch/user',
            providesTags: (result) => 
                result ? [{ type: 'User', state: {id: result.user.id,
                    login: result.user.login,
                    display_name: result.user.display_name,
                    email: result.user.email,
                    profile_image_url: result.user.profile_image_url
                 }}] : [],
        }),
        validUser: builder.query<Valid, void>({
            query: () => "/api/auth/validate",
            providesTags: (result) => 
                result ? [{type: "Valid", isValid: result.isValid}] : []
        }),
        refreshToken: builder.query<Refresh,void>({
            query: () => "/api/auth/refresh",
            providesTags: (result) =>
                result ? [{type: "Refresh", status: result.status}] : []
        }),
        logout: builder.mutation<LogoutResponse, void>({
            query: () => ({
                url: "/api/auth/logout",
                method: "POST",
            }),
            invalidatesTags: ["User", "Valid", "Auth"]
        }),
        addBotToChannel: builder.mutation<AddBotResponse, { channelId?: string } | void>({
            query: (body) => ({
                url: "/api/auth/railway/add-bot",
                method: "POST",
                body: body ?? {},
            }),
            invalidatesTags: ["BotStatus"],
        }),
        removeBotFromChannel: builder.mutation<RemoveBotResponse, { channelId?: string } | void>({
            query: (body) => ({
                url: "/api/auth/railway/remove-bot",
                method: "POST",
                body: body ?? {},
            }),
            invalidatesTags: ["BotStatus"],
        }),
        getBotChannelStatus: builder.query<BotChannelStatus, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/bot-status",
                params: { channelId },
            }),
            providesTags: (_result, _err, channelId) => [
                { type: "BotStatus", id: channelId },
            ],
        }),
        getManagedChannels: builder.query<ManagedChannelsResponse, void>({
            query: () => "/api/auth/railway/managed-channels",
        }),
    })
});

export const { 
    useGetUserQuery,
    useValidUserQuery,
    useRefreshTokenQuery,
    useLogoutMutation,
    useAddBotToChannelMutation,
    useRemoveBotFromChannelMutation,
    useGetBotChannelStatusQuery,
    useGetManagedChannelsQuery,
} = api;