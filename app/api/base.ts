import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getBackendUrl } from "~/lib/backend-url";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBackendUrl(),
  credentials: "include",
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
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

export const API_TAG_TYPES = [
  "User",
  "Valid",
  "Session",
  "Refresh",
  "Auth",
  "BotStatus",
  "DashboardBootstrap",
  "ChatModules",
  "ChannelAiPrompt",
  "ChannelAiModel",
  "CustomCommands",
  "Timers",
  "ClipsSettings",
  "ChannelEligibility",
  "Admin",
] as const;
