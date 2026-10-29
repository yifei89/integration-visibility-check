import type { Item } from "./schema";

type ThreadContentReply = {
  id?: string;
  username: string;
  content: string;
  replyTo?: string;
  replies?: ThreadContentReply[];
};
type ThreadContentPost = ThreadContentReply;
export type ThreadContentEntry = string[] | ThreadContentPost;

/** Convert both supported authoring formats to the ordered feed used by the player. */
export function normalizeThreadsContent(items: ThreadContentEntry[]): [string, string][] {
  const result: [string, string][] = [];
  const addReplies = (replies: ThreadContentReply[], parent: string) => {
    for (const reply of replies) {
      result.push([reply.username, `回复 @${reply.replyTo || parent}：${reply.content}`]);
      addReplies(reply.replies ?? [], reply.username);
    }
  };
  for (const entry of items) {
    if (Array.isArray(entry)) {
      const [sender, body] = entry;
      if (typeof sender === "string" && typeof body === "string") result.push([sender, body]);
    } else {
      result.push([entry.username, entry.content]);
      addReplies(entry.replies ?? [], entry.username);
    }
  }
  return result;
}

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
