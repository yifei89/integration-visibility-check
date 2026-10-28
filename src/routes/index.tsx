// FoundPhone runtime player route (migrated from exo-FoundPhone-Studio).
import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const StoryPlayer = lazy(() =>
  import("@/foundphone/runtime/StoryPlayer").then((m) => ({
    default: m.StoryPlayer,
  })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "捡手机 · FoundPhone Studio" },
      {
        name: "description",
        content:
          "《捡手机》是一个交互式虚拟手机故事框架：打开一部手机，翻阅聊天、照片和备忘录，推动剧情走向不同结局。",
      },
      { property: "og:title", content: "捡手机 · FoundPhone Studio" },
      {
        property: "og:description",
        content:
          "交互式虚拟手机故事：聊天、照片、密码、来电与多结局剧情，全部在浏览器中运行。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly
      fallback={
        <main className="story-runtime">
          <p role="status">正在打开手机…</p>
        </main>
      }
    >
      <Suspense
        fallback={
          <main className="story-runtime">
            <p role="status">正在打开手机…</p>
          </main>
        }
      >
        <StoryPlayer />
      </Suspense>
      <Link
        to="/studio"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 9999,
          padding: "10px 18px",
          borderRadius: 999,
          background: "#1c1c1e",
          color: "#f5f4f0",
          fontSize: 14,
          textDecoration: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        }}
      >
        打开创作器
      </Link>
    </ClientOnly>
  );
}
