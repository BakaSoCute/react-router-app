import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs"

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
      https: {
        key: fs.readFileSync('./dev.app.aleksandromelucik.ru+3-key.pem'),
        cert: fs.readFileSync('./dev.app.aleksandromelucik.ru+3.pem'),
      },
      host: 'dev.app.aleksandromelucik.ru',
      port: 3000,
    },
});
