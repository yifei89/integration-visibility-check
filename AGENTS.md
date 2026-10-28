<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture

- The app is a migration of exo-FoundPhone-Studio (捡手机): all app code lives in `src/foundphone/` (copied from the upstream `src/`, so relative depth changed by one level — watch `../` paths in tests). Route `/` renders the story player, `/studio` the editor; both are client-only (Dexie/IndexedDB, browser APIs), mounted via `ClientOnly` + `React.lazy`.
- `src/foundphone/` has its own `tsconfig.json` matching upstream's looser strictness; the root tsconfig drops `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess` etc. because route imports pull foundphone files into the program.
- Story data is precompiled: `stories/*/story.json` → `public/work.json`, `blank-work.json`, `test-work.json` via `node scripts/story.mjs build` (run from project root; it loads `src/foundphone/story-engine/compiler.ts` through Vite). Re-run it after editing stories.
- Standalone-player export assets live in `public/player-runtime/` (built upstream with `vite.player.config.ts` + `scripts/package-player.mjs`); `staticExport` in `src/foundphone/io.ts` zips them client-side. Original app icons live in `public/icon-assets/` and are enabled via the `VITE_ORIGINAL_ICONS` define in `vite.config.ts`.
- vite-plugin-pwa from upstream was not ported (conflicts with TanStack Start SSR build); offline caching is not available.
- Default app installation is centralized in `foundphone/apps.ts`; catalog records and content remain available for downloads. Database upgrades and preview layout revisions apply changed defaults once, so later user installations persist.
