import { describe, expect, it } from "vitest";
import { makeItem } from "./schema";
import { groupThreads, normalizeThreadsContent } from "./threadTree";

const it_ = (id: string, sender: string, body: string) => makeItem({ id, sender, body });

describe("groupThreads", () => {
  it("accepts legacy pairs and object posts with nested replies", () => {
    const entries = normalizeThreadsContent([
      ["legacy", "旧格式主帖"],
      { id: "post_001", username: "x0x_921", content: "主帖", replies: [
        { username: "7milk_03", content: "一楼" },
        { username: "x0x_921", content: "楼中楼", replyTo: "7milk_03" },
      ] },
    ]);
    expect(entries).toEqual([
      ["legacy", "旧格式主帖"], ["x0x_921", "主帖"],
      ["7milk_03", "回复 @x0x_921：一楼"], ["x0x_921", "回复 @7milk_03：楼中楼"],
    ]);
    const tree = groupThreads(entries.map(([sender, body], n) => it_(String(n), sender, body)));
    expect(tree.posts.map((post) => post.id)).toEqual(["0", "1"]);
    expect(tree.replies["1"].map((reply) => reply.nested)).toEqual([false, true]);
  });
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
