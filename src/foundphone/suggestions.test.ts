import { describe, it, expect } from "vitest";
import { suggestionMailto } from "./suggestions";

describe("suggestion app", () => {
  it("mails the suggestion with the player's name to the author", () => {
    const url = suggestionMailto("me@example.com", "朱妍", " 剧情很好 ");
    expect(url.startsWith("mailto:me@example.com?")).toBe(true);
    const q = new URLSearchParams(url.split("?")[1]);
    expect(q.get("subject")).toBe("「捡手机」建议 · 朱妍");
    expect(q.get("body")).toBe("剧情很好\n\n—— 来自 朱妍");
  });
});
