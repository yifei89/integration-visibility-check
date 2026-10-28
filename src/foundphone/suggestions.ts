/** Where the 「建议」 app delivers feedback; never shown in the UI. */
export const suggestionEmail = "zyooo058@163.com";
export const suggestionAppId = "suggest";

/** Payload for one anonymous suggestion. */
export function suggestionPayload(from: string, text: string) {
  return {
    _subject: `「捡手机」建议 · ${from || "匿名"}`,
    _template: "table",
    _captcha: "false",
    昵称: from || "匿名玩家",
    建议: text.trim(),
    时间: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
  };
}

/** Sends silently in the background via FormSubmit (works on static hosting too). */
export async function sendSuggestion(from: string, text: string) {
  const r = await fetch(`https://formsubmit.co/ajax/${suggestionEmail}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(suggestionPayload(from, text)),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || String(j.success) === "false") throw Error(j.message || "发送失败");
}
