import { useState } from "react";
import { ChevronLeft, Paperclip, Send, X } from "lucide-react";
import type { SkinProps } from "../AppSkins";
import { maxAttachmentBytes, sendSuggestion } from "../suggestions";

/** 「建议」app: write feedback (with optional media), sent silently to the author. */
export function SuggestSkin(p: SkinProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"" | "sending" | "sent" | "error" | "big">("");
  const total = files.reduce((n, f) => n + f.size, 0);
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
        <p>剧情、App、bug，想到什么都可以写，也可以附上图片、视频或音频。</p>
        <p>
          <b>提交后请稍等几秒，看到「已送达」再离开页面</b>，提前关闭可能发送失败。
        </p>
        <textarea
          aria-label="你的建议"
          placeholder="写下你的建议…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (state !== "sending") setState("");
          }}
        />
        <label className="suggest-send" style={{ cursor: "pointer" }}>
          <Paperclip size={16} /> 添加图片 / 视频 / 音频
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            hidden
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              e.target.value = "";
              const next = [...files, ...picked];
              if (next.reduce((n, f) => n + f.size, 0) > maxAttachmentBytes) return setState("big");
              setFiles(next);
              setState("");
            }}
          />
        </label>
        {files.map((f, i) => (
          <small key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            📎 {f.name}（{(f.size / 1024 / 1024).toFixed(1)}MB）
            <button aria-label="移除附件" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
              <X size={14} />
            </button>
          </small>
        ))}
        <button
          className="suggest-send"
          disabled={(!text.trim() && !files.length) || state === "sending"}
          onClick={async () => {
            setState("sending");
            try {
              await sendSuggestion(p.owner ?? "", text || "（仅附件）", files);
              setText("");
              setFiles([]);
              setState("sent");
            } catch {
              setState("error");
            }
          }}
        >
          <Send size={16} /> {state === "sending" ? "正在发送，请勿离开…" : "提交建议"}
        </button>
        {state === "sent" && <small>已送达作者，谢谢你！</small>}
        {state === "error" && <small>发送失败，请检查网络后再试。</small>}
        {state === "big" && <small>附件总共不能超过 10MB，请换小一点的文件。</small>}
        {total > 0 && state !== "big" && <small>附件越大，发送越慢，请耐心等待。</small>}
      </div>
    </div>
  );
}
