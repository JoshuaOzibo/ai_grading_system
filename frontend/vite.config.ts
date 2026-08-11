// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static SPA build: no SSR server, no platform adapter. `vite build` emits plain
// static files to dist/client that any static host can serve.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    // outputPath makes the shell dist/client/index.html instead of _shell.html,
    // so any static host serves it as the default document with no extra config.
    spa: { enabled: true, prerender: { outputPath: "/index.html" } },
  },
});
