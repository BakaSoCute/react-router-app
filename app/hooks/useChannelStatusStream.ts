import { useEffect, useRef, useState } from "react";
import { api, type BotChannelStatus } from "~/api";
import { getBackendUrl } from "~/lib/backend-url";
import { parseSseBlocks } from "~/lib/sse-client";
import { useAppDispatch } from "~/store/hooks";

export type ChannelStatusStreamState = "idle" | "connecting" | "open" | "error";

const MAX_RECONNECT_MS = 30_000;

type Options = {
  enabled: boolean;
  onSnapshot?: (status: BotChannelStatus) => void;
};

export function useChannelStatusStream(channelId: string, options: Options) {
  const { enabled, onSnapshot } = options;
  const dispatch = useAppDispatch();
  const [streamState, setStreamState] = useState<ChannelStatusStreamState>("idle");
  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  useEffect(() => {
    if (!enabled || !channelId) {
      setStreamState("idle");
      return;
    }

    let aborted = false;
    let reconnectAttempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let activeAbort: AbortController | null = null;

    const applySnapshot = (payload: BotChannelStatus) => {
      dispatch(api.util.upsertQueryData("getBotChannelStatus", channelId, payload));
      onSnapshotRef.current?.(payload);
    };

    const scheduleReconnect = () => {
      if (aborted) return;
      const delay = Math.min(MAX_RECONNECT_MS, 1000 * 2 ** reconnectAttempt);
      reconnectAttempt += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void connect();
      }, delay);
    };

    const connect = async () => {
      if (aborted) return;

      activeAbort?.abort();
      const ac = new AbortController();
      activeAbort = ac;

      setStreamState("connecting");

      const url = `${getBackendUrl()}/api/v1/stream/channel-status?channelId=${encodeURIComponent(channelId)}`;

      try {
        const res = await fetch(url, {
          credentials: "include",
          signal: ac.signal,
          headers: { Accept: "text/event-stream" },
        });

        if (aborted || ac.signal.aborted) return;

        if (!res.ok || !res.body) {
          setStreamState("error");
          scheduleReconnect();
          return;
        }

        setStreamState("open");
        reconnectAttempt = 0;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!aborted && !ac.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const { messages, rest } = parseSseBlocks(buffer);
          buffer = rest;

          for (const msg of messages) {
            if (msg.event !== "snapshot") continue;
            try {
              applySnapshot(JSON.parse(msg.data) as BotChannelStatus);
            } catch {
              /* ignore malformed payload */
            }
          }
        }

        if (!aborted && !ac.signal.aborted) {
          setStreamState("error");
          scheduleReconnect();
        }
      } catch (err) {
        if (aborted || ac.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStreamState("error");
        scheduleReconnect();
      }
    };

    void connect();

    return () => {
      aborted = true;
      activeAbort?.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      setStreamState("idle");
    };
  }, [channelId, enabled, dispatch]);

  return {
    streamState,
    isStreamOpen: streamState === "open",
  };
}
