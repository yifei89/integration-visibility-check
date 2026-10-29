import type { Item } from "./schema";

export type ThreadReply = { id: string; sender: string; replyTo: string; body: string; nested: boolean };

const prefix = /^回复\s*@([^：:]+)[：:]\s*/;

/** Group a flat feed so "回复 @x：" lines become the comment tree of the preceding main post. */
export function groupThreads(items: Item[]): { posts: Item[]; replies: Record<string, ThreadReply[]> } {
  const posts: Item[] = [];
  const replies: Record<string, ThreadReply[]> = {};
  let main: Item | null = null;
  for (const i of items) {
    const m = i.body.match(prefix);
    if (m && main) {
      const list = replies[main.id];
      const replyTo = m[1].trim();
      list.push({ id: i.id, sender: i.sender, replyTo, body: i.body.replace(prefix, ""), nested: replyTo !== main.sender });
    } else {
      main = i;
      posts.push(i);
      replies[i.id] = [];
    }
  }
  return { posts, replies };
}
