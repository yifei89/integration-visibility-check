import { describe, expect, it } from "vitest";
import { makeItem } from "./schema";
import { groupThreads } from "./threadTree";

const it_ = (id: string, sender: string, body: string) => makeItem({ id, sender, body });

describe("groupThreads", () => {
  it("puts replies under their main post and nests replies to commenters", () => {
    const { posts, replies } = groupThreads([
      it_("a", "x0x_921", "主帖"),
      it_("b", "7milk_03", "回复 @x0x_921：一楼"),
      it_("c", "x0x_921", "回复 @7milk_03：楼中楼"),
      it_("d", "kk_0412", "第二条主帖"),
    ]);
    expect(posts.map((p) => p.id)).toEqual(["a", "d"]);
    expect(replies.a.map((r) => [r.sender, r.replyTo, r.body, r.nested])).toEqual([
      ["7milk_03", "x0x_921", "一楼", false],
      ["x0x_921", "7milk_03", "楼中楼", true],
    ]);
    expect(replies.d).toEqual([]);
  });
});
