import { describe, expect, it } from "vitest";
import { suggestionPayload } from "./suggestions";

describe("suggestions", () => {
  it("trims text and falls back to anonymous", () => {
    const p = suggestionPayload("", " 剧情很好 ");
    expect(p.建议).toBe("剧情很好");
    expect(p.昵称).toBe("匿名玩家");
  });
});
