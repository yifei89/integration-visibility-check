import { useState } from "react";
import { ChevronLeft, Send } from "lucide-react";
import type { SkinProps } from "../AppSkins";
import { sendSuggestion } from "../suggestions";

/** 「建议」app: write feedback, the player's mail app sends it to the author. */
export function SuggestSkin(p: SkinProps) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"" | "sending" | "sent" | "error">("");
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
        <p>剧情、App、bug，想到什么都可以写。提交后会直接送到作者那里。</p>
        <textarea
          aria-label="你的建议"
          placeholder="写下你的建议…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (state !== "sending") setState("");
          }}
        />
        <button
          className="suggest-send"
          disabled={!text.trim() || state === "sending"}
          onClick={async () => {
            setState("sending");
            try {
              await sendSuggestion(p.owner ?? "", text);
              setText("");
              setState("sent");
            } catch {
              setState("error");
            }
          }}
        >
          <Send size={16} /> {state === "sending" ? "正在发送…" : "提交建议"}
        </button>
        {state === "sent" && <small>已送达作者，谢谢你！</small>}
        {state === "error" && <small>发送失败，请检查网络后再试。</small>}
      </div>
    </div>
  );
}
