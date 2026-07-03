export type User = {
  success: boolean;
  user: {
    id: string;
    login: string;
    display_name: string;
    email: string;
    description: string;
    profile_image_url: string;
    created_at: string;
    broadcaster_type: string;
    view_count: number;
  };
  timestamp: string;
};

export type Valid = {
  isValid: boolean;
};

export type SessionUser = {
  id: string;
  login: string;
  display_name: string;
  email?: string;
  description?: string;
  profile_image_url: string;
  created_at: string;
  broadcaster_type: string;
  view_count: number;
};

export type SessionResponse = {
  isValid: boolean;
  user: SessionUser | null;
  timestamp: string;
};

export type Refresh = {
  status: string;
};

export type LogoutResponse = {
  success: boolean;
  message?: string;
};

export type AddBotResponse = {
  success: boolean;
  message?: string;
  channelId?: string;
  login?: string;
  railway?: { ok?: boolean; skipped?: boolean; error?: string; data?: unknown };
  moderator?: { ok?: boolean; error?: string };
  rollback?: { ok: true } | { ok: false; error: string };
};

export type RemoveBotResponse = {
  success: boolean;
  message?: string;
  channelId?: string;
  login?: string;
  railway?: { ok?: boolean; skipped?: boolean; notRegistered?: boolean; error?: string; data?: unknown };
  moderator?: { ok?: boolean; error?: string };
};

export type CustomCommandUserLevel = "everyone" | "vip" | "mod" | "broadcaster";

export type ChannelTimerSnapshot = {
  name: string;
  nameIsDefault: boolean;
  active: boolean;
  remainingMs: number;
  totalMinutes: number;
  endsAt: number;
  startedByUserId: string;
  startedByLogin: string;
  userLevel: CustomCommandUserLevel;
};

export type BotChannelStatus = {
  channelId: string;
  subscribed: boolean;
  eventsubConnected: boolean;
  streamLive: boolean;
  botEnabled: boolean;
  timers: ChannelTimerSnapshot[];
};

export type TimersResponse = {
  success: boolean;
  channelId: string;
  active: ChannelTimerSnapshot[];
  invokeUserLevel: CustomCommandUserLevel;
};

export type ClipsSettingsResponse = {
  success: boolean;
  channelId: string;
  invokeUserLevel: CustomCommandUserLevel;
  cooldownSeconds: number;
};

export type ManagedChannel = {
  id: string;
  login: string;
  name: string;
  source: "self" | "moderated";
  moderatorRole?: "moderator" | "lead_moderator";
};

export type ManagedChannelsResponse = {
  success: boolean;
  user: {
    id: string;
    login: string;
  };
  channels: ManagedChannel[];
};

export type DashboardBootstrapResponse = {
  success: boolean;
  user: {
    id: string;
    login: string;
  };
  managedChannels: ManagedChannel[];
  botStatus: BotChannelStatus;
  eligibility?: ChannelEligibilityResponse | null;
};

export type ChatModuleItem = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export type ChatModulesResponse = {
  success: boolean;
  channelId: string;
  modules: ChatModuleItem[];
};

export type ChannelAiPromptResponse = {
  success: boolean;
  channelId: string;
  prompt: string;
};

export type AiModelCatalogItem = {
  provider: "deepseek" | "openai" | string;
  model: string;
  label: string;
  description?: string;
  enabled: boolean;
};

export type ChannelAiModelResponse = {
  success: boolean;
  channelId: string;
  provider: string;
  model: string;
  isDefault?: boolean;
  availableModels: AiModelCatalogItem[];
};

export const CHANNEL_AI_PROMPT_MAX_CHARS = 4000;

export type CustomCommandItem = {
  id: number;
  name: string;
  response: string;
  enabled: boolean;
  cooldownSeconds: number;
  userLevel: CustomCommandUserLevel;
  useCount: number;
  autoIntervalSeconds: number | null;
  autoLiveOnly: boolean;
  autoNextFireAt: number | null;
  autoLastSentAt: number | null;
  cooldownMessage: string | null;
};

export type CustomCommandsResponse = {
  success: boolean;
  channelId: string;
  commands: CustomCommandItem[];
};

export type CustomCommandSingleResponse = {
  success: boolean;
  channelId: string;
  command: CustomCommandItem;
};

export const CUSTOM_COMMAND_RESPONSE_MAX = 450;
export const CUSTOM_COMMANDS_MAX_PER_CHANNEL = 50;
export const AUTO_INTERVAL_MIN_SECONDS = 60;
export const AUTO_INTERVAL_MAX_SECONDS = 86400;
export const AUTO_MESSAGES_MAX_PER_CHANNEL = 10;

export type AutoMessageItem = {
  id: number;
  message: string;
  intervalSeconds: number;
  enabled: boolean;
  liveOnly: boolean;
  minChatLines: number;
  lastSentAt: number | null;
  nextFireAt: number;
  useCount: number;
};

export type AutoMessagesResponse = {
  success: boolean;
  channelId: string;
  messages: AutoMessageItem[];
};

export type AutoMessageSingleResponse = {
  success: boolean;
  channelId: string;
  message: AutoMessageItem;
};

export type CustomCommandPreviewResponse = {
  success: boolean;
  channelId: string;
  commandId: number;
  preview: string;
};

export type ChannelEligibilityChecks = {
  isPartner: boolean;
  isAffiliate: boolean;
  meetsFollowerThreshold: boolean;
};

export type ChannelEligibilityResponse = {
  success: boolean;
  eligible: boolean;
  broadcasterId: string;
  login?: string;
  broadcasterType: "" | "affiliate" | "partner";
  followerTotal: number | null;
  checks: ChannelEligibilityChecks;
  minFollowers: number;
  failureReasons: string[];
  bypassed?: boolean;
  disabled?: boolean;
};

export type AdminMeResponse = {
  success: boolean;
  isAdmin: boolean;
  userId?: string;
  login?: string;
};

export type AdminChannelItem = {
  channelId: string;
  login: string | null;
  addedAt: string | null;
  subscribed: boolean;
  streamLive: boolean;
  botEnabled: boolean;
  banned: boolean;
  banReason: string | null;
  bannedAt: string | null;
  bannedBy: string | null;
};

export type AdminChannelsResponse = {
  success: boolean;
  channels: AdminChannelItem[];
  count: number;
};
