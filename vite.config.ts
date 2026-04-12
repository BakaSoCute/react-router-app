import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "node:fs";
import path from "node:path";

const KEY = "dev.app.aleksandromelucik.ru+3-key.pem";
const CERT = "dev.app.aleksandromelucik.ru+3.pem";

function localDevServer():
  | {
      https: { key: Buffer; cert: Buffer };
      host: string;
      port: number;
    }
  | Record<string, never> {
  if (process.env.VERCEL || process.env.CI) {
    return {};
  }
  const root = process.cwd();
  const keyPath = path.join(root, KEY);
  const certPath = path.join(root, CERT);
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    return {};
  }
  return {
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    host: "dev.app.aleksandromelucik.ru",
    port: 3000,
  };
}

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: localDevServer(),
});
