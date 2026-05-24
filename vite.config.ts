import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

function resolvePort(rawPort: string | undefined, fallback: number): number {
  const port = Number(rawPort);
  return Number.isFinite(port) && port > 0 ? port : fallback;
}

function normalizeBasePath(rawBasePath: string | undefined): string {
  if (!rawBasePath || rawBasePath === "/") {
    return "/";
  }

  const trimmed = rawBasePath.trim().replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "/" : `/${trimmed}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = resolvePort(env.VITE_PORT ?? env.PORT, 5173);
  const apiProxyTarget = env.VITE_API_PROXY_TARGET ?? "http://localhost:3001";
  const basePath = normalizeBasePath(env.VITE_BASE_PATH);
  const hasRemoteApiBaseUrl = Boolean(env.VITE_API_BASE_URL);

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
      proxy: hasRemoteApiBaseUrl
        ? undefined
        : {
            "/api": {
              target: apiProxyTarget,
              changeOrigin: true,
            },
          },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
