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
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
