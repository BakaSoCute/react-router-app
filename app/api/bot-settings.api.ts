import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { API_TAG_TYPES } from "./base";
import type {
  ChannelAiModelResponse,
  ChannelAiPromptResponse,
  ChannelTimerSnapshot,
  ChatModuleItem,
  ChatModulesResponse,
  ClipsSettingsResponse,
  ModerationSettingsResponse,
  ModerationStrictness,
  BlockedUsersResponse,
  BlockedUserItem,
  ModerationLogResponse,
  CustomCommandItem,
  CustomCommandSingleResponse,
  CustomCommandPreviewResponse,
  CustomCommandUserLevel,
  CommandResponseType,
  AutoResponseType,
  CustomCommandsResponse,
  AutoMessageItem,
  AutoMessageSingleResponse,
  AutoMessagesResponse,
  TimersResponse,
} from "./types";

type ApiBuilder = EndpointBuilder<
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  (typeof API_TAG_TYPES)[number],
  "api"
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiRef = () => any;

export const botSettingsEndpoints = (builder: ApiBuilder, getApi: ApiRef) => ({
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
    async onQueryStarted({ channelId, moduleId, enabled }, { dispatch, queryFulfilled }) {
      const api = getApi();
      const patch = dispatch(
        api.util.updateQueryData("getChatModules", channelId, (draft: ChatModulesResponse) => {
          const mod = draft.modules.find((m: ChatModuleItem) => m.id === moduleId);
          if (mod) mod.enabled = enabled;
        })
      );
      try {
        await queryFulfilled;
      } catch {
        patch.undo();
      }
    },
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
    async onQueryStarted({ channelId, prompt }, { dispatch, queryFulfilled }) {
      const api = getApi();
      const patch = dispatch(
        api.util.updateQueryData("getChannelAiPrompt", channelId, (draft: ChannelAiPromptResponse) => {
          draft.prompt = prompt;
        })
      );
      try {
        await queryFulfilled;
      } catch {
        patch.undo();
      }
    },
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
    async onQueryStarted({ channelId, provider, model }, { dispatch, queryFulfilled }) {
      const api = getApi();
      const patch = dispatch(
        api.util.updateQueryData("getChannelAiModel", channelId, (draft: ChannelAiModelResponse) => {
          draft.provider = provider;
          draft.model = model;
          draft.isDefault = false;
        })
      );
      try {
        await queryFulfilled;
      } catch {
        patch.undo();
      }
    },
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
      channelId: string;
      name: string;
      response: string;
      enabled?: boolean;
      cooldownSeconds?: number;
      userLevel?: CustomCommandUserLevel;
      autoIntervalSeconds?: number | null;
      autoLiveOnly?: boolean;
      cooldownMessage?: string | null;
      responseType?: CommandResponseType;
      autoResponseType?: AutoResponseType;
    }
  >({
    query: (body) => ({
      url: "/api/auth/railway/custom-commands",
      method: "POST",
      body,
    }),
    async onQueryStarted(arg, { dispatch, queryFulfilled }) {
      const api = getApi();
      const tempId = -Date.now();
      const patch = dispatch(
        api.util.updateQueryData("getCustomCommands", arg.channelId, (draft: CustomCommandsResponse) => {
          draft.commands.push({
            id: tempId,
            name: arg.name,
            response: arg.response,
            enabled: arg.enabled ?? true,
            cooldownSeconds: arg.cooldownSeconds ?? 0,
            userLevel: arg.userLevel ?? "everyone",
            useCount: 0,
            autoIntervalSeconds: null,
            autoLiveOnly: true,
            autoNextFireAt: null,
            autoLastSentAt: null,
            cooldownMessage: null,
            responseType: arg.responseType ?? "reply",
            autoResponseType: arg.autoResponseType ?? "chat",
          });
        })
      );
      try {
        const { data } = await queryFulfilled;
        dispatch(
          api.util.updateQueryData("getCustomCommands", arg.channelId, (draft: CustomCommandsResponse) => {
            const idx = draft.commands.findIndex((c: CustomCommandItem) => c.id === tempId);
            if (idx >= 0) draft.commands[idx] = data.command;
          })
        );
      } catch {
        patch.undo();
      }
    },
  }),
  patchCustomCommand: builder.mutation<
    CustomCommandSingleResponse,
    {
      channelId: string;
      commandId: number;
      name?: string;
      response?: string;
      enabled?: boolean;
      cooldownSeconds?: number;
      userLevel?: CustomCommandUserLevel;
      autoIntervalSeconds?: number | null;
      autoLiveOnly?: boolean;
      cooldownMessage?: string | null;
      resetUseCount?: boolean;
      responseType?: CommandResponseType;
      autoResponseType?: AutoResponseType;
    }
  >({
    query: (body) => ({
      url: "/api/auth/railway/custom-commands",
      method: "PATCH",
      body,
    }),
    async onQueryStarted(arg, { dispatch, queryFulfilled }) {
      const api = getApi();
      const patch = dispatch(
        api.util.updateQueryData("getCustomCommands", arg.channelId, (draft: CustomCommandsResponse) => {
          const cmd = draft.commands.find((c: CustomCommandItem) => c.id === arg.commandId);
          if (!cmd) return;
          if (arg.name !== undefined) cmd.name = arg.name;
          if (arg.response !== undefined) cmd.response = arg.response;
          if (arg.enabled !== undefined) cmd.enabled = arg.enabled;
          if (arg.cooldownSeconds !== undefined) cmd.cooldownSeconds = arg.cooldownSeconds;
          if (arg.userLevel !== undefined) cmd.userLevel = arg.userLevel;
          if (arg.autoIntervalSeconds !== undefined) cmd.autoIntervalSeconds = arg.autoIntervalSeconds;
          if (arg.autoLiveOnly !== undefined) cmd.autoLiveOnly = arg.autoLiveOnly;
          if (arg.cooldownMessage !== undefined) cmd.cooldownMessage = arg.cooldownMessage;
          if (arg.responseType !== undefined) cmd.responseType = arg.responseType;
          if (arg.autoResponseType !== undefined) cmd.autoResponseType = arg.autoResponseType;
          if (arg.resetUseCount) cmd.useCount = 0;
        })
      );
      try {
        const { data } = await queryFulfilled;
        dispatch(
          api.util.updateQueryData("getCustomCommands", arg.channelId, (draft: CustomCommandsResponse) => {
            const idx = draft.commands.findIndex((c: CustomCommandItem) => c.id === arg.commandId);
            if (idx >= 0) draft.commands[idx] = data.command;
          })
        );
      } catch {
        patch.undo();
      }
    },
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
    async onQueryStarted({ channelId, commandId }, { dispatch, queryFulfilled }) {
      const api = getApi();
      const patch = dispatch(
        api.util.updateQueryData("getCustomCommands", channelId, (draft: CustomCommandsResponse) => {
          draft.commands = draft.commands.filter((c: CustomCommandItem) => c.id !== commandId);
        })
      );
      try {
        await queryFulfilled;
      } catch {
        patch.undo();
      }
    },
  }),
  previewCustomCommand: builder.mutation<
    CustomCommandPreviewResponse,
    { channelId: string; commandId: number; query?: string }
  >({
    query: (body) => ({
      url: "/api/auth/railway/custom-commands/preview",
      method: "POST",
      body,
    }),
  }),
  getAutoMessages: builder.query<AutoMessagesResponse, string>({
    query: (channelId) => ({
      url: "/api/auth/railway/auto-messages",
      params: { channelId },
    }),
    keepUnusedDataFor: 120,
    providesTags: (result) =>
      result?.channelId ? [{ type: "AutoMessages", id: result.channelId }] : [],
  }),
  createAutoMessage: builder.mutation<
    AutoMessageSingleResponse,
    {
      channelId: string;
      message: string;
      intervalSeconds: number;
      enabled?: boolean;
      liveOnly?: boolean;
      minChatLines?: number;
      responseType?: AutoResponseType;
    }
  >({
    query: (body) => ({
      url: "/api/auth/railway/auto-messages",
      method: "POST",
      body,
    }),
    invalidatesTags: (_r, _e, arg) => [{ type: "AutoMessages", id: arg.channelId }],
  }),
  patchAutoMessage: builder.mutation<
    AutoMessageSingleResponse,
    {
      channelId: string;
      messageId: number;
      message?: string;
      intervalSeconds?: number;
      enabled?: boolean;
      liveOnly?: boolean;
      minChatLines?: number;
      responseType?: AutoResponseType;
    }
  >({
    query: (body) => ({
      url: "/api/auth/railway/auto-messages",
      method: "PATCH",
      body,
    }),
    invalidatesTags: (_r, _e, arg) => [{ type: "AutoMessages", id: arg.channelId }],
  }),
  deleteAutoMessage: builder.mutation<
    { success: boolean; channelId: string; messageId: number },
    { channelId: string; messageId: number }
  >({
    query: (body) => ({
      url: "/api/auth/railway/auto-messages",
      method: "DELETE",
      body,
    }),
    invalidatesTags: (_r, _e, arg) => [{ type: "AutoMessages", id: arg.channelId }],
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
    async onQueryStarted({ channelId, userLevel }, { dispatch, queryFulfilled }) {
      const api = getApi();
      const patch = dispatch(
        api.util.updateQueryData("getChannelTimers", channelId, (draft: TimersResponse) => {
          draft.invokeUserLevel = userLevel;
        })
      );
      try {
        await queryFulfilled;
      } catch {
        patch.undo();
      }
    },
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
    async onQueryStarted(arg, { dispatch, queryFulfilled }) {
      const api = getApi();
      const patch = dispatch(
        api.util.updateQueryData("getClipsSettings", arg.channelId, (draft: ClipsSettingsResponse) => {
          if (arg.userLevel !== undefined) draft.invokeUserLevel = arg.userLevel;
          if (arg.cooldownSeconds !== undefined) draft.cooldownSeconds = arg.cooldownSeconds;
        })
      );
      try {
        await queryFulfilled;
      } catch {
        patch.undo();
      }
    },
  }),
  getModerationSettings: builder.query<ModerationSettingsResponse, string>({
    query: (channelId) => ({
      url: "/api/auth/railway/moderation/settings",
      params: { channelId },
    }),
    keepUnusedDataFor: 120,
    providesTags: (result) =>
      result?.channelId ? [{ type: "ModerationSettings", id: result.channelId }] : [],
  }),
  patchModerationSettings: builder.mutation<
    ModerationSettingsResponse,
    {
      channelId: string;
      defaultTimeoutSeconds?: number;
      cooldownSeconds?: number;
      strictness?: ModerationStrictness;
      customRules?: string | null;
      vipExempt?: boolean;
    }
  >({
    query: (body) => ({
      url: "/api/auth/railway/moderation/settings",
      method: "PATCH",
      body,
    }),
    invalidatesTags: (_result, _err, arg) => [{ type: "ModerationSettings", id: arg.channelId }],
  }),
  getBlockedUsers: builder.query<BlockedUsersResponse, string>({
    query: (channelId) => ({
      url: "/api/auth/railway/blocked-users",
      params: { channelId },
    }),
    keepUnusedDataFor: 120,
    providesTags: (result) =>
      result?.channelId ? [{ type: "BlockedUsers", id: result.channelId }] : [],
  }),
  addBlockedUser: builder.mutation<
    { success: boolean; channelId: string; user: BlockedUserItem },
    { channelId: string; login: string; reason?: string | null }
  >({
    query: (body) => ({
      url: "/api/auth/railway/blocked-users",
      method: "POST",
      body,
    }),
    invalidatesTags: (_result, _err, arg) => [
      { type: "BlockedUsers", id: arg.channelId },
      { type: "ModerationLog", id: arg.channelId },
    ],
  }),
  removeBlockedUser: builder.mutation<
    { success: boolean; channelId: string; userId: string },
    { channelId: string; userId: string }
  >({
    query: (body) => ({
      url: "/api/auth/railway/blocked-users",
      method: "DELETE",
      body,
    }),
    invalidatesTags: (_result, _err, arg) => [
      { type: "BlockedUsers", id: arg.channelId },
      { type: "ModerationLog", id: arg.channelId },
    ],
  }),
  getModerationLog: builder.query<
    ModerationLogResponse,
    { channelId: string; limit?: number; offset?: number }
  >({
    query: ({ channelId, limit = 50, offset = 0 }) => ({
      url: "/api/auth/railway/moderation/log",
      params: { channelId, limit, offset },
    }),
    keepUnusedDataFor: 60,
    providesTags: (result) =>
      result?.channelId ? [{ type: "ModerationLog", id: result.channelId }] : [],
  }),
});
