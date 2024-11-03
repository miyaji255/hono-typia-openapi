import { defineConfig } from "vitest/config";
import UnpluginTypia from "@ryoppippi/unplugin-typia/vite";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/test/**/*.ts"],
      clean: true,
      all: true,
    },
  },
  plugins: [UnpluginTypia({ cache: true })],
});
