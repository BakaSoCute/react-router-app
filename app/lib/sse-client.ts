export type SseMessage = {
  event: string;
  data: string;
};

/** Parse SSE blocks separated by blank lines from a text buffer. */
export function parseSseBlocks(buffer: string): { messages: SseMessage[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const messages: SseMessage[] = [];

  for (const block of parts) {
    if (!block.trim() || block.startsWith(":")) continue;

    let event = "message";
    const dataLines: string[] = [];

    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length > 0) {
      messages.push({ event, data: dataLines.join("\n") });
    }
  }

  return { messages, rest };
}
