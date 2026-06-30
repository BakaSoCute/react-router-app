import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { API_TAG_TYPES } from "./base";
import type { AdminChannelsResponse, AdminMeResponse } from "./types";

type ApiBuilder = EndpointBuilder<
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  (typeof API_TAG_TYPES)[number],
  "api"
>;

export const adminEndpoints = (builder: ApiBuilder) => ({
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
});
