/** Where the 「建议」 app sends feedback; players' mail app opens with this address filled in. */
export const suggestionEmail = "";
export const suggestionAppId = "suggest";

/** mailto link for one suggestion; the player's own mail app sends it. */
export function suggestionMailto(to: string, from: string, text: string) {
  const subject = `「捡手机」建议 · ${from || "匿名"}`;
  const body = `${text.trim()}\n\n—— 来自 ${from || "匿名玩家"}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
