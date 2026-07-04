import { api as coreApi } from "./core";
import { authEndpoints } from "./auth.api";
import { dashboardEndpoints } from "./dashboard.api";
import { botSettingsEndpoints } from "./bot-settings.api";
import { adminEndpoints } from "./admin.api";

export { baseQueryWithReauth } from "./base";
export * from "./types";

const apiWithAuth = coreApi.injectEndpoints({
  endpoints: authEndpoints,
  overrideExisting: false,
});

const apiWithDashboard = apiWithAuth.injectEndpoints({
  endpoints: dashboardEndpoints,
  overrideExisting: false,
});

const apiRef: { current: typeof apiWithDashboard | null } = { current: null };

const apiWithBotSettings = apiWithDashboard.injectEndpoints({
  endpoints: (builder) => botSettingsEndpoints(builder, () => apiRef.current!),
  overrideExisting: false,
});

export const api = apiWithBotSettings.injectEndpoints({
  endpoints: adminEndpoints,
  overrideExisting: false,
});

apiRef.current = api;

export const {
  useGetSessionQuery,
  useGetUserQuery,
  useValidUserQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetDashboardBootstrapQuery,
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
  usePreviewCustomCommandMutation,
  useGetAutoMessagesQuery,
  useCreateAutoMessageMutation,
  usePatchAutoMessageMutation,
  useDeleteAutoMessageMutation,
  useGetChannelTimersQuery,
  usePatchTimerPermissionMutation,
  useStartChannelTimerMutation,
  useCancelChannelTimerMutation,
  useGetClipsSettingsQuery,
  usePatchClipsSettingsMutation,
  useGetModerationSettingsQuery,
  usePatchModerationSettingsMutation,
  useGetBlockedUsersQuery,
  useAddBlockedUserMutation,
  useRemoveBlockedUserMutation,
  useGetModerationLogQuery,
  useGetAdminMeQuery,
  useGetAdminChannelsQuery,
  useAdminDisconnectChannelMutation,
  useAdminBanChannelMutation,
  useAdminUnbanChannelMutation,
} = api;
