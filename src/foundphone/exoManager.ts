import content from "./exo-manager-content.json";
import dialogue from "./exo-dialogue.json";
import { applyPlayerSetup } from "./playerSetup";
import { autoReplyFolder } from "./wechatReplies";
import { suggestionAppId } from "./suggestions";
import { registry } from "./registry";
import { makeItem, type Item, type StoryNode, type Work } from "./schema";

export const exoImportMarker = "exo_manager_import_v1";
export const exoAppIds: Record<string, string> = {
  电话: "phone", 信息: "messages", 通讯录: "contacts", 相册: "photos",
  相机: "camera", Safari: "safari", 备忘录: "notes", 日历: "calendar",
  邮件: "mail", 时钟: "clock", 提醒事项: "reminders", 文件: "files",
  音乐: "music", 地图: "maps", 天气: "weather", 钱包: "wallet",
  健康: "health", 查找: "find", 计算器: "calculator", 设置: "settings",
  "App Store": "appstore", 微信: "wechat", QQ: "qq", 微博: "weibo",
  小红书: "redbook", 抖音: "douyin", 哔哩哔哩: "bilibili", 支付宝: "alipay",
  淘宝: "taobao", 网易云音乐: "netease", 论坛: "forum", 大众点评: "dianping",
  Instagram: "instagram", TikTok: "tiktok", X: "twitter", KakaoTalk: "kakao",
  Threads: "threads", YouTube: "youtube", Spotify: "spotify", Google: "google",
  Gmail: "gmail", "Google Maps": "googlemaps", Discord: "discord", Reddit: "reddit",
  Pinterest: "pinterest", WhatsApp: "whatsapp", Telegram: "telegram", LINE: "line", Netflix: "netflix",
};
const stamp = "2026-10-28 09:42";
function record(app: string, index: string | number, title: string, body: string, extra: Partial<Item> = {}) {
  return makeItem({ id: `exo-${app}-${index}`, title, body, sender: title,
    time: stamp, meta: { source: "EXO 新人经纪人 · 架空剧情" }, ...extra });
}
function node(id: string, extra: Partial<StoryNode>): StoryNode {
  return { id, label: id, type: "action", event: "", target: "", conditions: [],
    logic: "and", actions: [], next: [], once: true, x: 80, y: 80, ...extra };
}

/** Add the supplied story once; preserve user-authored records and installation choices. */
export function importExoManager(w: Work): boolean {
  const setupChanged = applyPlayerSetup(w);
  if (w.variables[exoImportMarker]) return applyExoExtras(w) || setupChanged;
  const put = (app: string, item: Item) => {
    w.data[app] ??= [];
    if (!w.data[app].some((i) => i.id === item.id)) w.data[app].push(item);
  };
  for (const [name, section] of Object.entries(content.apps)) {
    const app = exoAppIds[name];
    if (!app) continue;
    if (!w.apps.some((a) => a.id === app)) {
      w.apps.push({ id: app, name, installed: false, visible: false, dock: false, folder: "", icon: "" });
    }
    w.data[app] = (w.data[app] ?? []).filter((i) => !i.id.startsWith("test-"));
    section.items.forEach(([title, body], index) => {
      const engine = registry.find((a) => a.id === app)?.engine;
      const extra: Partial<Item> = { folder: section.title,
        kind: engine === "social" ? "post" : engine === "document" ? "note" : "text",
        favorite: /收藏|书签/.test(title + body) };
      const time = (body.match(/\b\d{2}:\d{2}\b/)?.[0]);
      if (time) extra.time = `${body.includes("昨天") ? "2026-10-27" : "2026-10-28"} ${time}`;
      if (app === "calendar") {
        extra.time = `2026-10-28 ${title}`;
        extra.kind = "event";
      }
      if (app === "clock") extra.meta = { clock: title };
      if (app === "safari") extra.folder = "历史记录";
      if (app === "mail" || app === "gmail") extra.folder = "收件箱";
      if (app === "phone") { extra.kind = "call"; extra.meta = { status: body.includes("未接") ? "未接" : body.includes("已拨") ? "已拨" : "已接" }; }
      if (app === "photos") extra.kind = "image";
      if (app === "files") { extra.kind = "file"; extra.meta = { extension: title.split(".").at(-1) ?? "" }; }
      if (app === "weather") extra.meta = { locationLabel: title, temperature: body.match(/(\d+)°C/)?.[1] ?? "", condition: body.split(" · ")[0] };
      if (app === "instagram" && title.includes("Story")) extra.folder = "Story";
      if (app === "wallet" && title === "咖啡消费") extra.folder = "交易";
      if (app === "health") extra.meta = { metric: title, value: body.split("（")[0] };
      put(app, record(app, index, title, body, extra));
    });
  }
  // The HTML's list summaries and its actual chat transcripts are separate content.
  Object.entries(content.chats).forEach(([thread, messages], threadIndex) => {
    messages.forEach(([sender, body], index) => put("wechat", record("wechat", `chat-${threadIndex}-${index}`, thread, body, {
      sender, outgoing: sender === "我", folder: "微信", time: `2026-10-28 09:${String(20 + index).padStart(2, "0")}`,
    })));
    const replies = content.replies[thread as keyof typeof content.replies] ?? [];
    const offers = replies.map((_, index) => `exo-offer-${threadIndex}-${index}`);
    replies.forEach(([label, sender, body], index) => {
      const replyId = `exo-reply-${threadIndex}-${index}`;
      const sentId = `exo-wechat-sent-${threadIndex}-${index}`;
      const receivedId = `exo-wechat-received-${threadIndex}-${index}`;
      put("wechat", record("wechat", `sent-${threadIndex}-${index}`, thread, label, { hidden: true, sender: "我", outgoing: true, folder: "微信" }));
      put("wechat", record("wechat", `received-${threadIndex}-${index}`, thread, body, { hidden: true, sender, folder: "微信" }));
      w.nodes.push(node(offers[index], { label: `回复 ${thread}`, event: "read", target: thread, once: false,
        conditions: [{ key: replyId, op: "neq", value: true }],
        actions: [{ type: "choice", key: replyId, value: label }], }));
      w.nodes.push(node(replyId, { label, actions: [
        { type: "unlock", key: sentId, value: true }, { type: "unlock", key: receivedId, value: true },
        { type: "variable", key: replyId, value: true },
      ], next: offers }));
    });
  });
  w.nodes.push(node("exo-notifications-start", { label: "开始工作日通知", event: "openApp", target: "wechat", next: ["exo-notice-0"] }));
  content.events.forEach((e, index) => {
    const app = exoAppIds[e.app];
    const item = record(app, `notice-${index}`, e.target || e.from, e.text, {
      hidden: true, sender: e.add?.[0] || e.from, folder: app === "wechat" ? "微信" : "",
    });
    put(app, item);
    w.nodes.push(node(`exo-notice-${index}`, { label: `${e.app} · ${e.from}`, type: "delay", delayMs: 24000,
      actions: [{ type: "unlock", key: item.id, value: true }, { type: "notification", key: app, value: `${e.app} · ${e.from}：${e.text}` }],
      next: index + 1 < content.events.length ? [`exo-notice-${index + 1}`] : [] }));
  });
  w.variables[exoImportMarker] = true;
  w.mode = "mixed";
  applyExoExtras(w);
  return true;
}

export const exoExtrasMarker = "exo_manager_media_v2";
const media = (file: string) => `./media/${file}.jpg`;
/** Member names and nicknames as they appear in the uploaded chats → bundled avatar. */
export const exoAvatars: Record<string, string> = {
  金俊勉: media("avatar-suho"), 俊勉哥: media("avatar-suho"),
  朴灿烈: media("avatar-chanyeol"), 灿烈哥: media("avatar-chanyeol"),
  都暻秀: media("avatar-do"), 暻秀哥: media("avatar-do"),
  金钟仁: media("avatar-kai"), 钟仁哥: media("avatar-kai"),
  吴世勋: media("avatar-sehun"), 世勋: media("avatar-sehun"),
  "EXO工作群（6）": media("avatar-group"),
};
const avatarFor = (text: string) =>
  Object.entries(exoAvatars).find(([name]) => text.includes(name))?.[1] ?? "";
const exoPhotos = [
  ["exo-01", "2018 KBS 歌谣大祝祭 · 红毯"], ["exo-02", "2016 KBS 歌谣大祝祭 · 红毯"],
  ["exo-03", "Monster 舞台 · 水原"], ["exo-04", "灿烈、俊勉、世勋 · 新加坡活动"],
  ["exo-05", "俊勉 · EXO'luXion 澳门"], ["exo-06", "俊勉 · 2024 活动"],
  ["exo-07", "灿烈 · 演唱会嘉宾"], ["exo-08", "灿烈 · ElyXiOn 曼谷"],
  ["exo-09", "暻秀 · SMTOWN LIVE 首尔"], ["exo-10", "暻秀 · 电影发布会"],
  ["exo-11", "钟仁 · EXO'luXion 香港"], ["exo-12", "钟仁 · 电台录制"],
  ["exo-13", "世勋 · Music Bank 柏林"], ["exo-14", "世勋 · 品牌活动"],
  ["exo-15", "EXO-K · 2012 丽水世博"], ["exo-16", "世勋 · EXO'rDIUM"],
] as const;
/** Apps whose posts/media read as picture content; fill empty ones with the EXO photo pool. */
const pictureApps = ["photos", "instagram", "threads", "weibo", "redbook", "douyin", "bilibili", "tiktok",
  "twitter", "youtube", "pinterest", "reddit", "netflix"];

/**
 * Second pass over the imported story (once): member avatars, EXO photos, pictures for
 * text-only apps, free-typing WeChat (fixed replies instead of choices) and notifications
 * that name the chat they belong to.
 */
export function applyExoExtras(w: Work): boolean {
  const suggest = addSuggestionApp(w);
  if (w.variables[exoExtrasMarker]) return applyExoDialogue(w) || suggest;
  // WeChat: drop reply choices; the member answers become the thread's fixed replies.
  w.nodes = w.nodes.filter((n) => !/^exo-(offer|reply)-/.test(n.id));
  w.data.wechat = (w.data.wechat ?? []).filter((i) => !i.id.startsWith("exo-wechat-sent-"));
  for (const i of w.data.wechat) {
    if (i.id.startsWith("exo-wechat-received-")) {
      i.folder = autoReplyFolder;
      i.hidden = false;
    }
  }
  // Notifications name the chat so tapping them opens it.
  content.events.forEach((e, index) => {
    if (exoAppIds[e.app] !== "wechat" || !e.target) return;
    const action = w.nodes.find((n) => n.id === `exo-notice-${index}`)?.actions.find((a) => a.type === "notification");
    if (action) action.value = `微信 · ${e.target}：${e.target === e.from ? "" : e.from + "："}${e.text}`;
  });
  // Avatars for every member mention, and the thread picture for WeChat chats.
  for (const items of Object.values(w.data)) {
    for (const i of items) {
      if (!i.avatar && !i.outgoing) i.avatar = avatarFor(i.sender) || avatarFor(i.title);
    }
  }
  for (const i of w.data.wechat) {
    const a = exoAvatars[i.title];
    if (a) i.meta = { ...i.meta, threadAvatar: a };
  }
  // Photos album.
  w.data.photos ??= [];
  exoPhotos.forEach(([file, caption], index) => {
    if (w.data.photos.some((i) => i.id === `exo-photo-${index}`)) return;
    w.data.photos.push(makeItem({ id: `exo-photo-${index}`, title: caption, body: caption,
      kind: "image", media: media(file), folder: "EXO", time: `2026-10-${String(10 + index).padStart(2, "0")} 20:00`,
      sender: "相册", meta: { source: "Wikimedia Commons · 见 media/credits.txt" } }));
  });
  // Text-only picture apps get photos from the same pool.
  let next = 0;
  for (const app of pictureApps) {
    for (const i of w.data[app] ?? []) {
      if (i.media) continue;
      if (i.kind === "audio" || i.kind === "video") continue;
      i.media = media(exoPhotos[next++ % exoPhotos.length][0]);
    }
  }
  w.variables[exoExtrasMarker] = true;
  applyExoDialogue(w);
  return true;
}
export const exoDialogueMarker = "exo_dialogue_ko_v2";
/** Members' own voice (Korean with Chinese translation): replaces imported chats, fixed replies and notices once. */
export function applyExoDialogue(w: Work): boolean {
  if (w.variables[exoDialogueMarker]) return false;
  const threads = Object.keys(content.chats);
  // The manager is older than Sehun (he calls her 누나), so his chat is 世勋, not 世勋哥.
  for (const items of Object.values(w.data)) for (const i of items) {
    i.title = i.title.replaceAll("世勋哥", "世勋");
    i.body = i.body.replaceAll("世勋哥", "世勋");
  }
  for (const n of w.nodes) {
    n.target = n.target.replaceAll("世勋哥", "世勋");
    for (const a of n.actions) if (typeof a.value === "string") a.value = a.value.replaceAll("世勋哥", "世勋");
  }
  // The HTML's chat-list summaries would show up as extra messages inside each chat.
  w.data.wechat = (w.data.wechat ?? []).filter((i) => !/^exo-wechat-\d+$/.test(i.id));
  threads.forEach((thread, t) => {
    const chats = dialogue.chats[thread as keyof typeof dialogue.chats] ?? [];
    const replies = dialogue.replies[thread as keyof typeof dialogue.replies] ?? [];
    const avatar = exoAvatars[thread];
    w.data.wechat = w.data.wechat.filter((i) => !i.id.startsWith(`exo-wechat-chat-${t}-`) && !i.id.startsWith(`exo-wechat-received-${t}-`));
    chats.forEach(([sender, body], i) => w.data.wechat.push(record("wechat", `chat-${t}-${i}`, thread, body, {
      sender, outgoing: sender === "我", folder: "微信", avatar: sender === "我" ? "" : avatarFor(sender),
      time: `2026-10-28 09:${String(20 + i).padStart(2, "0")}`, meta: { source: "EXO 新人经纪人 · 架空剧情", threadAvatar: avatar },
    })));
    replies.forEach(([sender, body], i) => w.data.wechat.push(record("wechat", `received-${t}-${i}`, thread, body, {
      sender, folder: autoReplyFolder, avatar: avatarFor(sender), meta: { source: "EXO 新人经纪人 · 架空剧情", threadAvatar: avatar },
    })));
  });
  dialogue.events.forEach((text, index) => {
    if (!text) return;
    const e = content.events[index];
    const app = exoAppIds[e.app];
    const item = w.data[app]?.find((i) => i.id === `exo-${app}-notice-${index}`);
    if (item) item.body = text;
    const action = w.nodes.find((n) => n.id === `exo-notice-${index}`)?.actions.find((a) => a.type === "notification");
    if (action) action.value = app === "wechat" && e.target
      ? `微信 · ${e.target}：${e.target === e.from ? "" : e.from + "："}${text}`
      : `${e.app} · ${e.from}：${text}`;
  });
  w.variables[exoDialogueMarker] = true;
  return true;
}
const suggestMarker = "suggest_app_v1";
/** The 「建议」 app is installed once on every work; a later uninstall sticks. */
export function addSuggestionApp(w: Work): boolean {
  if (w.variables[suggestMarker]) return false;
  if (!w.apps.some((a) => a.id === suggestionAppId))
    w.apps.push({ id: suggestionAppId, name: "建议", installed: true, visible: true, dock: false, folder: "", icon: "💡" });
  w.variables[suggestMarker] = true;
  return true;
}
