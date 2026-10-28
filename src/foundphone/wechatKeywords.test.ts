import { describe, expect, it } from "vitest";
import { keywordReply } from "./wechatKeywords";

describe("keywordReply", () => {
  it("Sehun says he is 23", () => {
    expect(keywordReply("世勋", "你今年几岁？")).toContain("二十三");
  });
  it("no match falls back to the story", () => {
    expect(keywordReply("世勋", "嗯")).toBeUndefined();
  });
});
