import type { Item } from "./schema";

/** WeChat records in this folder are the fixed lines a chat answers with, whatever the player types. */
export const autoReplyFolder = "自动回复";

/** The reply for the player's Nth message (0-based) in a thread; the fixed lines repeat in order. */
export function nextAutoReply(replies: Item[], sentBefore: number): Item | undefined {
  if (!replies.length) return undefined;
  return replies[sentBefore % replies.length];
}
