import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSkinState } from "./skinState";
import type { SkinProps } from "./AppSkins";
import { safeMedia, type Item } from "./schema";

function Moment({ item, p }: { item: Item; p: SkinProps }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `moment:${item.id}:liked`, false);
  const [comments, setComments] = useSkinState<string[]>(p, `moment:${item.id}:comments`, []);
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const owner = p.owner || "我";
  return <article className="wx-moment-post">
    <span className="skin-avatar">
      <img src={safeMedia(item.avatar) || "./media/avatar-chanyeol.jpg"} alt={`${item.sender}头像`} />
    </span>
    <div>
      <strong>{item.sender}</strong>
      <p>{item.body}</p>
      {item.media && <img className="wx-moment-media" src={safeMedia(item.media)} alt={item.title} />}
      <small>{item.time}</small>
      <div className="wx-moment-actions">
        <Button variant="ghost" size="icon" title={liked ? "取消点赞" : "点赞"} aria-label={liked ? "取消点赞" : "点赞"} aria-pressed={liked} onClick={() => setLiked(!liked)}>
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </Button>
        <Button variant="ghost" size="icon" title="回复" aria-label="回复" onClick={() => setReplying(!replying)}><MessageCircle size={17} /></Button>
      </div>
      {(liked || comments.length > 0) && <div className="wx-moment-responses">
        {liked && <div className="wx-moment-likes"><Heart size={12} />{owner}</div>}
        {comments.map((text, index) => <p key={index}><strong>{owner}：</strong>{text}</p>)}
      </div>}
      {replying && <form className="wx-moment-reply" onSubmit={(e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        setComments([...comments, draft.trim()]);
        setDraft("");
        setReplying(false);
      }}>
        <input autoFocus aria-label={`回复${item.sender}`} value={draft} onChange={(e) => setDraft(e.target.value)} />
        <Button variant="ghost" size="icon" type="submit" title="发送回复" aria-label="发送回复" disabled={!draft.trim()}><Send size={17} /></Button>
      </form>}
    </div>
  </article>;
}

export function WeChatMoments({ p, posts }: { p: SkinProps; posts: Item[] }) {
  return <div className="wx-moments">
    <div className="wx-moment-cover"><img src="./media/exo-05.jpg" alt="金俊勉" /></div>
    {posts.map((item) => <Moment key={item.id} item={item} p={p} />)}
    {!posts.length && <p className="skin-empty">暂无朋友圈动态</p>}
    {p.creator && <Button variant="ghost" className="phone-add" onClick={p.onAdd}>添加朋友圈动态</Button>}
  </div>;
}