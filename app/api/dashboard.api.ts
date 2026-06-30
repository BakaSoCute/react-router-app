import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { API_TAG_TYPES } from "./base";
import type {
  AddBotResponse,
  BotChannelStatus,
  ChannelEligibilityResponse,
  DashboardBootstrapResponse,
  ManagedChannelsResponse,
  RemoveBotResponse,
} from "./types";

type ApiBuilder = EndpointBuilder<
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  (typeof API_TAG_TYPES)[number],
  "api"
>;

export const dashboardEndpoints = (builder: ApiBuilder) => ({
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
    invalidatesTags: [
      "BotStatus",
      "DashboardBootstrap",
      "ChatModules",
      "ChannelAiPrompt",
      "ChannelAiModel",
      "CustomCommands",
      "Timers",
    ],
  }),
  removeBotFromChannel: builder.mutation<RemoveBotResponse, { channelId?: string } | void>({
    query: (body) => ({
      url: "/api/auth/railway/remove-bot",
      method: "POST",
      body: body ?? {},
    }),
    invalidatesTags: [
      "BotStatus",
      "DashboardBootstrap",
      "ChatModules",
      "ChannelAiPrompt",
      "ChannelAiModel",
      "CustomCommands",
      "Timers",
    ],
  }),
  getBotChannelStatus: builder.query<BotChannelStatus, string>({
    query: (channelId) => ({
      url: "/api/auth/railway/bot-status",
      params: { channelId },
    }),
    keepUnusedDataFor: 60,
    providesTags: (_result, _err, channelId) => [{ type: "BotStatus", id: channelId }],
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
});
