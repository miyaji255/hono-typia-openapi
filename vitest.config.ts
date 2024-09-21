import { defineConfig } from "vitest/config";
import UnpluginTypia from "@ryoppippi/unplugin-typia/vite";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  plugins: [UnpluginTypia({ cache: true })],
});
