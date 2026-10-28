import { describe, expect, it } from "vitest";
import { createEmptyWork } from "./demo";
import { importExoManager, exoAppIds } from "./exoManager";
import { advance, choose, dispatch, visible } from "./engine";
import { initialRuntime, makeItem, validateWork } from "./schema";

describe("EXO manager content import", () => {
  it("imports all 49 source apps, preserving the 25 installed apps and phone settings", () => {
    const w = createEmptyWork();
    const phone = structuredClone(w.phone);
    const apps = structuredClone(w.apps);
    importExoManager(w);
    expect(Object.keys(exoAppIds)).toHaveLength(49);
    for (const id of Object.values(exoAppIds)) expect(w.data[id].length).toBeGreaterThan(0);
    expect(w.apps.filter((a) => a.installed)).toHaveLength(25);
    expect(w.phone).toEqual({ ...phone, passcode: "0412" });
    for (const a of apps) expect(w.apps.find((b) => a.id === b.id)).toEqual(a);
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
  it("replies unlock the original outgoing message and member response once", () => {
    const w = createEmptyWork(); importExoManager(w);
    let s = dispatch(w, initialRuntime(w), "read", "灿烈哥");
    const option = s.choices.find((c) => c.label === "下午两点，七楼会议室");
    expect(option).toBeDefined();
    if (!option) throw Error("Missing reply");
    s = choose(w, s, option.target);
    expect(w.data.wechat.some((i) => i.body === "啊对对ㅋㅋ 谢谢！" && visible(i, s))).toBe(true);
    expect(s.choices.some((c) => c.target === option.target)).toBe(false);
  });
  it("delivers the first notification after 24 seconds and all ten in sequence", () => {
    const w = createEmptyWork(); importExoManager(w);
    let s = dispatch(w, initialRuntime(w), "openApp", "wechat");
    s = advance(w, s, 23999);
    expect(s.notifications).toHaveLength(0);
    s = advance(w, s, 1);
    expect(s.notifications).toEqual(["微信 · 灿烈哥：下午几点来着ㅋㅋ"]);
    s = advance(w, s, 216000);
    expect(s.notifications).toHaveLength(10);
    expect(s.notifications[9]).toBe("微信 · 暻秀哥：忙完记得吃饭。");
  });
});