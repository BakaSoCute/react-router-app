import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getBackendUrl } from "~/lib/backend-url";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: getBackendUrl(),
    credentials: 'include'
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        const url = typeof args === "string" ? args : args.url;
        const isAuthEndpoint =
            url.includes("/api/auth/refresh") ||
            url.includes("/api/auth/logout") ||
            url.includes("/api/auth/twitch");

        if (!isAuthEndpoint) {
            const refreshResult = await rawBaseQuery(
                { url: "/api/auth/refresh", method: "POST" },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                result = await rawBaseQuery(args, api, extraOptions);
            }
        }
    }

    return result;
};

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
type SessionUser = {
    id: string,
    login: string,
    display_name: string,
    email?: string,
    description?: string,
    profile_image_url: string,
    created_at: string,
    broadcaster_type: string,
    view_count: number
}
type SessionResponse = {
    isValid: boolean
    user: SessionUser | null
    timestamp: string
}
type DashboardBootstrapResponse = {
    success: boolean
    user: {
        id: string
        login: string
    }
    managedChannels: ManagedChannel[]
    botStatus: BotChannelStatus
    eligibility?: ChannelEligibilityResponse | null
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

export type ChannelTimerSnapshot = {
    name: string
    nameIsDefault: boolean
    active: boolean
    remainingMs: number
    totalMinutes: number
    endsAt: number
    startedByUserId: string
    startedByLogin: string
    userLevel: CustomCommandUserLevel
}

export type BotChannelStatus = {
    channelId: string
    subscribed: boolean
    eventsubConnected: boolean
    streamLive: boolean
    botEnabled: boolean
    timers: ChannelTimerSnapshot[]
}

export type TimersResponse = {
    success: boolean
    channelId: string
    active: ChannelTimerSnapshot[]
    /** Кто может вызывать !timer в чате (для всех имён таймеров на канале). */
    invokeUserLevel: CustomCommandUserLevel
}

export type ClipsSettingsResponse = {
    success: boolean
    channelId: string
    invokeUserLevel: CustomCommandUserLevel
    cooldownSeconds: number
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

export type ChatModuleItem = {
    id: string
    title: string
    description: string
    enabled: boolean
}

export type ChatModulesResponse = {
    success: boolean
    channelId: string
    modules: ChatModuleItem[]
}

export type ChannelAiPromptResponse = {
    success: boolean
    channelId: string
    /** Пустая строка — дополнительный промт не задан */
    prompt: string
}

export type AiModelCatalogItem = {
    provider: "deepseek" | "openai" | string
    model: string
    label: string
    description?: string
    enabled: boolean
}

export type ChannelAiModelResponse = {
    success: boolean
    channelId: string
    provider: string
    model: string
    isDefault?: boolean
    availableModels: AiModelCatalogItem[]
}

/** Согласовано с бот-сервером (`CHANNEL_AI_PROMPT_MAX_CHARS`) */
export const CHANNEL_AI_PROMPT_MAX_CHARS = 4000

export type CustomCommandUserLevel = "everyone" | "vip" | "mod" | "broadcaster"

export type CustomCommandItem = {
    id: number
    name: string
    response: string
    enabled: boolean
    cooldownSeconds: number
    userLevel: CustomCommandUserLevel
    useCount: number
}

export type CustomCommandsResponse = {
    success: boolean
    channelId: string
    commands: CustomCommandItem[]
}

export type CustomCommandSingleResponse = {
    success: boolean
    channelId: string
    command: CustomCommandItem
}

export const CUSTOM_COMMAND_RESPONSE_MAX = 450
export const CUSTOM_COMMANDS_MAX_PER_CHANNEL = 50

export type ChannelEligibilityChecks = {
    isPartner: boolean
    isAffiliate: boolean
    meetsFollowerThreshold: boolean
}

export type AdminMeResponse = {
    success: boolean
    isAdmin: boolean
    userId?: string
    login?: string
}

export type AdminChannelItem = {
    channelId: string
    login: string | null
    addedAt: string | null
    subscribed: boolean
    streamLive: boolean
    botEnabled: boolean
    banned: boolean
    banReason: string | null
    bannedAt: string | null
    bannedBy: string | null
}

export type AdminChannelsResponse = {
    success: boolean
    channels: AdminChannelItem[]
    count: number
}

export type ChannelEligibilityResponse = {
    success: boolean
    eligible: boolean
    broadcasterId: string
    login?: string
    broadcasterType: "" | "affiliate" | "partner"
    followerTotal: number | null
    checks: ChannelEligibilityChecks
    minFollowers: number
    failureReasons: string[]
    bypassed?: boolean
    disabled?: boolean
}

export const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User","Valid","Session","Refresh","Auth","BotStatus","DashboardBootstrap","ChatModules","ChannelAiPrompt","ChannelAiModel","CustomCommands","Timers","ClipsSettings","ChannelEligibility","Admin"],
    endpoints: (builder) => ({
        getSession: builder.query<SessionResponse, void>({
            query: () => '/api/auth/session',
            keepUnusedDataFor: 60,
            providesTags: (result) =>
                result?.isValid && result.user
                    ? [{ type: 'Session', id: result.user.id }, { type: 'Auth' }]
                    : [{ type: 'Auth' }],
        }),
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
        refreshToken: builder.mutation<Refresh, void>({
            query: () => ({
                url: "/api/auth/refresh",
                method: "POST",
            }),
        }),
        logout: builder.mutation<LogoutResponse, void>({
            query: () => ({
                url: "/api/auth/logout",
                method: "POST",
            }),
            invalidatesTags: ["User", "Valid", "Session", "Auth"]
        }),
        getDashboardBootstrap: builder.query<DashboardBootstrapResponse, string>({
            query: (channelId) => ({
                url: "/api/v1/dashboard/bootstrap",
                params: { channelId },
            }),
            keepUnusedDataFor: 120,
            providesTags: (_result, _err, channelId) => [
                { type: "DashboardBootstrap", id: channelId },
                { type: "BotStatus", id: channelId },
                { type: "ChannelEligibility", id: channelId },
            ],
        }),
        addBotToChannel: builder.mutation<AddBotResponse, { channelId?: string } | void>({
            query: (body) => ({
                url: "/api/auth/railway/add-bot",
                method: "POST",
                body: body ?? {},
            }),
            invalidatesTags: ["BotStatus", "DashboardBootstrap", "ChatModules", "ChannelAiPrompt", "ChannelAiModel", "CustomCommands", "Timers"],
        }),
        removeBotFromChannel: builder.mutation<RemoveBotResponse, { channelId?: string } | void>({
            query: (body) => ({
                url: "/api/auth/railway/remove-bot",
                method: "POST",
                body: body ?? {},
            }),
            invalidatesTags: ["BotStatus", "DashboardBootstrap", "ChatModules", "ChannelAiPrompt", "ChannelAiModel", "CustomCommands", "Timers"],
        }),
        getBotChannelStatus: builder.query<BotChannelStatus, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/bot-status",
                params: { channelId },
            }),
            keepUnusedDataFor: 60,
            providesTags: (_result, _err, channelId) => [
                { type: "BotStatus", id: channelId },
            ],
        }),
        getChannelEligibility: builder.query<ChannelEligibilityResponse, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/channel-eligibility",
                params: { channelId },
            }),
            keepUnusedDataFor: 180,
            providesTags: (_result, _err, channelId) => [
                { type: "ChannelEligibility", id: channelId },
            ],
        }),
        getManagedChannels: builder.query<ManagedChannelsResponse, void>({
            query: () => "/api/auth/railway/managed-channels",
            keepUnusedDataFor: 300,
        }),
        getChatModules: builder.query<ChatModulesResponse, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/chat-modules",
                params: { channelId },
            }),
            keepUnusedDataFor: 120,
            providesTags: (result) =>
                result?.channelId ? [{ type: "ChatModules", id: result.channelId }] : [],
        }),
        patchChatModule: builder.mutation<
            ChatModulesResponse,
            { channelId: string; moduleId: string; enabled: boolean }
        >({
            query: (body) => ({
                url: "/api/auth/railway/chat-modules",
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [{ type: "ChatModules", id: arg.channelId }],
        }),
        getChannelAiPrompt: builder.query<ChannelAiPromptResponse, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/channel-ai-prompt",
                params: { channelId },
            }),
            keepUnusedDataFor: 120,
            providesTags: (result) =>
                result?.channelId ? [{ type: "ChannelAiPrompt", id: result.channelId }] : [],
        }),
        patchChannelAiPrompt: builder.mutation<
            ChannelAiPromptResponse,
            { channelId: string; prompt: string }
        >({
            query: (body) => ({
                url: "/api/auth/railway/channel-ai-prompt",
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [{ type: "ChannelAiPrompt", id: arg.channelId }],
        }),
        getChannelAiModel: builder.query<ChannelAiModelResponse, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/channel-ai-model",
                params: { channelId },
            }),
            keepUnusedDataFor: 120,
            providesTags: (result) =>
                result?.channelId ? [{ type: "ChannelAiModel", id: result.channelId }] : [],
        }),
        patchChannelAiModel: builder.mutation<
            ChannelAiModelResponse,
            { channelId: string; provider: string; model: string }
        >({
            query: (body) => ({
                url: "/api/auth/railway/channel-ai-model",
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [{ type: "ChannelAiModel", id: arg.channelId }],
        }),
        getCustomCommands: builder.query<CustomCommandsResponse, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/custom-commands",
                params: { channelId },
            }),
            keepUnusedDataFor: 120,
            providesTags: (result) =>
                result?.channelId ? [{ type: "CustomCommands", id: result.channelId }] : [],
        }),
        createCustomCommand: builder.mutation<
            CustomCommandSingleResponse,
            {
                channelId: string
                name: string
                response: string
                enabled?: boolean
                cooldownSeconds?: number
                userLevel?: CustomCommandUserLevel
            }
        >({
            query: (body) => ({
                url: "/api/auth/railway/custom-commands",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [{ type: "CustomCommands", id: arg.channelId }],
        }),
        patchCustomCommand: builder.mutation<
            CustomCommandSingleResponse,
            {
                channelId: string
                commandId: number
                name?: string
                response?: string
                enabled?: boolean
                cooldownSeconds?: number
                userLevel?: CustomCommandUserLevel
            }
        >({
            query: (body) => ({
                url: "/api/auth/railway/custom-commands",
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [{ type: "CustomCommands", id: arg.channelId }],
        }),
        deleteCustomCommand: builder.mutation<
            { success: boolean; channelId: string; commandId: number },
            { channelId: string; commandId: number }
        >({
            query: (body) => ({
                url: "/api/auth/railway/custom-commands",
                method: "DELETE",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [{ type: "CustomCommands", id: arg.channelId }],
        }),
        getChannelTimers: builder.query<TimersResponse, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/timers",
                params: { channelId },
            }),
            keepUnusedDataFor: 120,
            providesTags: (result) =>
                result?.channelId ? [{ type: "Timers", id: result.channelId }] : [],
        }),
        patchTimerPermission: builder.mutation<
            { success: boolean; channelId: string; invokeUserLevel: CustomCommandUserLevel },
            { channelId: string; userLevel: CustomCommandUserLevel }
        >({
            query: (body) => ({
                url: "/api/auth/railway/timers/permissions",
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [
                { type: "Timers", id: arg.channelId },
                { type: "BotStatus", id: arg.channelId },
            ],
        }),
        startChannelTimer: builder.mutation<
            { success: boolean; channelId: string; active: ChannelTimerSnapshot[] },
            { channelId: string; minutes: number; name?: string }
        >({
            query: (body) => ({
                url: "/api/auth/railway/timers/start",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [
                { type: "Timers", id: arg.channelId },
                { type: "BotStatus", id: arg.channelId },
            ],
        }),
        cancelChannelTimer: builder.mutation<
            { success: boolean; channelId: string; active: ChannelTimerSnapshot[] },
            { channelId: string; name?: string }
        >({
            query: (body) => ({
                url: "/api/auth/railway/timers/cancel",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [
                { type: "Timers", id: arg.channelId },
                { type: "BotStatus", id: arg.channelId },
            ],
        }),
        getClipsSettings: builder.query<ClipsSettingsResponse, string>({
            query: (channelId) => ({
                url: "/api/auth/railway/clips/settings",
                params: { channelId },
            }),
            keepUnusedDataFor: 120,
            providesTags: (result) =>
                result?.channelId ? [{ type: "ClipsSettings", id: result.channelId }] : [],
        }),
        patchClipsSettings: builder.mutation<
            ClipsSettingsResponse,
            { channelId: string; userLevel?: CustomCommandUserLevel; cooldownSeconds?: number }
        >({
            query: (body) => ({
                url: "/api/auth/railway/clips/settings",
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [{ type: "ClipsSettings", id: arg.channelId }],
        }),
        getAdminMe: builder.query<AdminMeResponse, void>({
            query: () => "/api/auth/admin/me",
            providesTags: [{ type: "Admin", id: "me" }],
        }),
        getAdminChannels: builder.query<AdminChannelsResponse, void>({
            query: () => "/api/auth/admin/channels",
            providesTags: [{ type: "Admin", id: "channels" }],
        }),
        adminDisconnectChannel: builder.mutation<
            { success: boolean; channelId: string },
            { channelId: string }
        >({
            query: (body) => ({
                url: "/api/auth/admin/channels/disconnect",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Admin", id: "channels" }, "BotStatus"],
        }),
        adminBanChannel: builder.mutation<
            { success: boolean; channelId: string; banned: boolean },
            { channelId: string; reason?: string }
        >({
            query: (body) => ({
                url: "/api/auth/admin/channels/ban",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Admin", id: "channels" }, "BotStatus"],
        }),
        adminUnbanChannel: builder.mutation<
            { success: boolean; channelId: string },
            { channelId: string }
        >({
            query: (body) => ({
                url: "/api/auth/admin/channels/unban",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Admin", id: "channels" }],
        }),
    })
});

export const { 
    useGetSessionQuery,
    useGetUserQuery,
    useValidUserQuery,
    useGetDashboardBootstrapQuery,
    useRefreshTokenMutation,
    useLogoutMutation,
    useAddBotToChannelMutation,
    useRemoveBotFromChannelMutation,
    useGetBotChannelStatusQuery,
    useGetChannelEligibilityQuery,
    useGetManagedChannelsQuery,
    useGetChatModulesQuery,
    usePatchChatModuleMutation,
    useGetChannelAiPromptQuery,
    usePatchChannelAiPromptMutation,
    useGetChannelAiModelQuery,
    usePatchChannelAiModelMutation,
    useGetCustomCommandsQuery,
    useCreateCustomCommandMutation,
    usePatchCustomCommandMutation,
    useDeleteCustomCommandMutation,
    useGetChannelTimersQuery,
    usePatchTimerPermissionMutation,
    useStartChannelTimerMutation,
    useCancelChannelTimerMutation,
    useGetClipsSettingsQuery,
    usePatchClipsSettingsMutation,
    useGetAdminMeQuery,
    useGetAdminChannelsQuery,
    useAdminDisconnectChannelMutation,
    useAdminBanChannelMutation,
    useAdminUnbanChannelMutation,
} = api;