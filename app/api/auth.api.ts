import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { API_TAG_TYPES } from "./base";
import type { LogoutResponse, Refresh, SessionResponse, User, Valid } from "./types";

type ApiBuilder = EndpointBuilder<
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  (typeof API_TAG_TYPES)[number],
  "api"
>;

export const authEndpoints = (builder: ApiBuilder) => ({
  getSession: builder.query<SessionResponse, void>({
    query: () => "/api/auth/session",
    keepUnusedDataFor: 60,
    providesTags: (result) =>
      result?.isValid && result.user
        ? [{ type: "Session", id: result.user.id }, { type: "Auth" }]
        : [{ type: "Auth" }],
  }),
  getUser: builder.query<User, void>({
    query: () => "/api/auth/twitch/user",
    providesTags: (result) =>
      result
        ? [
            {
              type: "User",
              state: {
                id: result.user.id,
                login: result.user.login,
                display_name: result.user.display_name,
                email: result.user.email,
                profile_image_url: result.user.profile_image_url,
              },
            },
          ]
        : [],
  }),
  validUser: builder.query<Valid, void>({
    query: () => "/api/auth/validate",
    providesTags: (result) =>
      result ? [{ type: "Valid", isValid: result.isValid }] : [],
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
    invalidatesTags: ["User", "Valid", "Session", "Auth"],
  }),
});
