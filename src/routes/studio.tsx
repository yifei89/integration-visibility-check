import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Studio = lazy(() =>
  import("@/foundphone/main").then((m) => ({ default: m.Studio })),
);

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "创作器 · 捡手机 FoundPhone Studio" },
      {
        name: "description",
        content:
          "捡手机创作器：编辑角色、聊天记录、App 内容、剧情事件与多结局，作品保存在本机浏览器中。",
      },
      { property: "og:title", content: "创作器 · 捡手机 FoundPhone Studio" },
      {
        property: "og:description",
        content:
          "在浏览器里创作交互式虚拟手机故事：聊天、社交、照片、密码与剧情编排。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  return (
    <ClientOnly
      fallback={
        <div className="boot">
          <h1>捡手机</h1>
          <p>正在打开你的故事工作室…</p>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="boot">
            <h1>捡手机</h1>
            <p>正在打开你的故事工作室…</p>
          </div>
        }
      >
        <Studio />
      </Suspense>
    </ClientOnly>
  );
}
