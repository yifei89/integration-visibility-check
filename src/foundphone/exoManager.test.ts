import { describe, expect, it } from "vitest";
import { createEmptyWork } from "./demo";
import { importExoManager, exoAppIds, exoDialogueMarker } from "./exoManager";
import { advance, dispatch } from "./engine";
import { autoReplyFolder, nextAutoReply } from "./wechatReplies";
import { notificationContent } from "./SystemNotifications";
import { initialRuntime, makeItem, validateWork } from "./schema";

describe("EXO manager content import", () => {
  it("imports all 49 source apps, preserving the 25 installed apps and phone settings", () => {
    const w = createEmptyWork();
    const phone = structuredClone(w.phone);
    const apps = structuredClone(w.apps);
    importExoManager(w);
    expect(Object.keys(exoAppIds)).toHaveLength(49);
    for (const id of Object.values(exoAppIds)) expect(w.data[id].length).toBeGreaterThan(0);
    expect(w.apps.filter((a) => a.installed && a.id !== "suggest")).toHaveLength(25);
    expect(w.apps.find((a) => a.id === "suggest")?.installed).toBe(true);
    expect(w.phone).toEqual({ ...phone, passcode: "0412" });
    for (const a of apps.filter((x) => x.id !== "suggest")) expect(w.apps.find((b) => a.id === b.id)).toEqual(a);
    expect(w.apps.find((a) => a.id === "googlemaps")?.installed).toBe(false);
    expect(validateWork(w).data.notes[0].title).toBe("入职第一周");
  });
  it("preserves user content and imports only once", () => {
    const w = createEmptyWork();
    w.data.notes = [makeItem({ id: "mine", body: "自己的笔记" })];
    expect(importExoManager(w)).toBe(true);
    const snapshot = structuredClone(w);
    expect(importExoManager(w)).toBe(false);
    expect(w).toEqual(snapshot);
    expect(w.data.notes[0].body).toBe("自己的笔记");
  });
  it("keeps meeting date and alarm values from the uploaded file", () => {
    const w = createEmptyWork(); importExoManager(w);
    expect(w.data.calendar.find((i) => i.body === "EXO 五人工作会议 · 7F")?.time).toBe("2026-10-28 14:00");
    expect(w.data.clock[0].meta.clock).toBe("07:10");
    expect(w.data.kakao[0].body).toContain("오늘 2시, 7층입니다.");
  });
  it("WeChat has no reply choices; each chat answers with its fixed lines in order", () => {
    const w = createEmptyWork(); importExoManager(w);
    const s = dispatch(w, initialRuntime(w), "read", "灿烈哥");
    expect(s.choices).toHaveLength(0);
    const replies = w.data.wechat.filter((i) => i.title === "灿烈哥" && i.folder === autoReplyFolder);
    expect(replies).toHaveLength(15);
    expect(replies.slice(0, 2).map((r) => r.body)).toEqual(["아 맞다 맞다 ㅋㅋㅋㅋ 고마워요!!!（啊对对对ㅋㅋㅋㅋ 谢谢！！！）", "알겠어요!! 제가 1등으로 도착할게요 ㅋㅋㅋ（知道啦！！我要第一个到ㅋㅋㅋ）"]);
    expect(nextAutoReply(replies, 0)?.body).toBe("아 맞다 맞다 ㅋㅋㅋㅋ 고마워요!!!（啊对对对ㅋㅋㅋㅋ 谢谢！！！）");
    expect(nextAutoReply(replies, 1)?.body).toBe("알겠어요!! 제가 1등으로 도착할게요 ㅋㅋㅋ（知道啦！！我要第一个到ㅋㅋㅋ）");
    expect(nextAutoReply(replies, 15)?.body).toBe("아 맞다 맞다 ㅋㅋㅋㅋ 고마워요!!!（啊对对对ㅋㅋㅋㅋ 谢谢！！！）");
  });
  it("Sehun's story keeps free typing with 32 ordered replies and no choice panel", () => {
    const w = createEmptyWork(); importExoManager(w);
    const replies = w.data.wechat.filter((i) => i.title === "世勋" && i.folder === autoReplyFolder);
    expect(replies).toHaveLength(32);
    for (let index = 0; index < replies.length; index++) {
      expect(nextAutoReply(replies, index)?.id).toBe(replies[index].id);
    }
    expect(dispatch(w, initialRuntime(w), "read", "世勋").choices).toHaveLength(0);
    expect(nextAutoReply(replies, 32)?.id).toBe(replies[0].id);
  });
  it("upgrades previously imported dialogue once without deleting personal records", () => {
    const w = createEmptyWork(); importExoManager(w);
    delete w.variables[exoDialogueMarker];
    w.variables.exo_dialogue_ko_v2 = true;
    w.data.wechat = w.data.wechat.filter((i) => i.title !== "世勋" || i.folder !== autoReplyFolder);
    w.data.wechat.push(makeItem({ id: "my-chat", title: "世勋", body: "我的留言", outgoing: true }));
    expect(importExoManager(w)).toBe(true);
    expect(w.data.wechat.filter((i) => i.title === "世勋" && i.folder === autoReplyFolder)).toHaveLength(32);
    expect(w.data.wechat.some((i) => i.id === "my-chat")).toBe(true);
    expect(importExoManager(w)).toBe(false);
  });
  it("group notifications name the group chat so tapping opens it", () => {
    const w = createEmptyWork(); importExoManager(w);
    const n = notificationContent("微信 · EXO工作群（6）：俊勉哥：다들 도착했어요? 누구 아직이에요?（大家都到了吗？还差谁？）", w.apps);
    expect(n.appId).toBe("wechat");
    expect(n.thread).toBe("EXO工作群（6）");
    const action = w.nodes.find((x) => x.id === "exo-notice-4")?.actions.find((a) => a.type === "notification");
    expect(action?.value).toBe("微信 · EXO工作群（6）：俊勉哥：다들 도착했어요? 누구 아직이에요?（大家都到了吗？还差谁？）");
  });
  it("members get their own avatar and the album holds 16 EXO photos", () => {
    const w = createEmptyWork(); importExoManager(w);
    expect(w.data.wechat.find((i) => i.sender === "朴灿烈")?.avatar).toBe("./media/avatar-chanyeol.jpg");
    expect(w.data.wechat.find((i) => i.title === "EXO工作群（6）")?.meta.threadAvatar).toBe("./media/avatar-group.jpg");
    expect(w.data.photos.filter((i) => i.id.startsWith("exo-photo-") && i.media.startsWith("./media/exo-"))).toHaveLength(16);
    expect(w.data.photos.every((i) => i.media)).toBe(true);
  });
  it("delivers the first notification after 24 seconds and all ten in sequence", () => {
    const w = createEmptyWork(); importExoManager(w);
    let s = dispatch(w, initialRuntime(w), "openApp", "wechat");
    s = advance(w, s, 23999);
    expect(s.notifications).toHaveLength(0);
    s = advance(w, s, 1);
    expect(s.notifications).toEqual(["微信 · 灿烈哥：근데 오후에 몇 시였죠…? ㅋㅋㅋ（下午是几点来着…？ㅋㅋㅋ）"]);
    s = advance(w, s, 216000);
    expect(s.notifications).toHaveLength(10);
    expect(s.notifications[9]).toBe("微信 · 暻秀哥：일 끝나면 밥 꼭 먹어요.（忙完记得吃饭。）");
  });
});