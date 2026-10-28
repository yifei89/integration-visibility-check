/** Where the 「建议」 app delivers feedback; never shown in the UI. */
export const suggestionEmail = "zyooo058@163.com";
export const suggestionAppId = "suggest";
/** Email service total attachment limit. */
export const maxAttachmentBytes = 10 * 1024 * 1024;

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
export async function sendSuggestion(from: string, text: string, files: File[] = []) {
  const body = new FormData();
  for (const [k, v] of Object.entries(suggestionPayload(from, text))) body.append(k, v);
  files.forEach((f, i) => body.append(i ? `attachment${i + 1}` : "attachment", f, f.name));
  const r = await fetch(`https://formsubmit.co/ajax/${suggestionEmail}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || String(j.success) === "false") throw Error(j.message || "发送失败");
}
