import content from "./exo-manager-content.json";
import { applyPlayerSetup } from "./playerSetup";
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
  if (w.variables[exoImportMarker]) return setupChanged;
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
  return true;
}