// GitHub Pages entry: static SPA, "#studio" opens the editor, otherwise the player.
import { StrictMode, lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const StoryPlayer = lazy(() =>
  import("../src/foundphone/runtime/StoryPlayer").then((m) => ({ default: m.StoryPlayer })),
);
const Studio = lazy(() => import("../src/foundphone/main").then((m) => ({ default: m.Studio })));

function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const on = () => setHash(location.hash);
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  const studio = hash === "#studio";
  return (
    <Suspense fallback={<p role="status">正在打开手机…</p>}>
      {studio ? <Studio /> : <StoryPlayer />}
      {!studio && (
        <a
          href="#studio"
          style={{
            position: "fixed", right: 16, bottom: 16, zIndex: 9999, padding: "10px 18px",
            borderRadius: 999, background: "#1c1c1e", color: "#f5f4f0", fontSize: 14,
            textDecoration: "none", boxShadow: "0 8px 24px rgba(0,0,0,.25)",
          }}
        >
          打开创作器
        </a>
      )}
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
