import { useState } from "react";
import { ChevronLeft, Send } from "lucide-react";
import type { SkinProps } from "../AppSkins";
import { suggestionEmail, suggestionMailto } from "../suggestions";

/** 「建议」app: write feedback, the player's mail app sends it to the author. */
export function SuggestSkin(p: SkinProps) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const ready = !!suggestionEmail;
  return (
    <div className="catalog-skin suggest-skin">
      <div className="app-nav">
        <button aria-label="返回" onClick={p.onBack}>
          <ChevronLeft size={23} />
        </button>
        <strong>建议</strong>
        <span />
      </div>
      <div className="suggest-body">
        <h1>说说你的想法</h1>
        <p>剧情、App、bug，想到什么都可以写。提交后会打开邮箱，把意见直接发给作者。</p>
        <textarea
          aria-label="你的建议"
          placeholder="写下你的建议…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSent(false);
          }}
        />
        <button
          className="suggest-send"
          disabled={!text.trim() || !ready}
          onClick={() => {
            window.location.href = suggestionMailto(suggestionEmail, p.owner ?? "", text);
            setSent(true);
          }}
        >
          <Send size={16} /> 用邮件发送
        </button>
        {!ready && <small>作者还没有设置收件邮箱。</small>}
        {sent && <small>已打开邮箱，点发送就完成啦，谢谢你！</small>}
      </div>
    </div>
  );
}
