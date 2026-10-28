import { describe, expect, it } from "vitest";
import { keywordReply } from "./wechatKeywords";

describe("keywordReply", () => {
  it("Sehun says he is 23", () => {
    expect(keywordReply("世勋", "你今年几岁？")).toContain("二十三");
  });
  it("members answer their 2017 ages", () => {
    expect(keywordReply("俊勉哥", "几岁")).toContain("二十六");
    expect(keywordReply("灿烈哥", "几岁")).toContain("二十四");
    expect(keywordReply("暻秀哥", "几岁")).toContain("二十四");
    expect(keywordReply("钟仁哥", "几岁")).toContain("二十三");
  });
  it("no match falls back to the story", () => {
    expect(keywordReply("世勋", "嗯")).toBeUndefined();
  });
});
