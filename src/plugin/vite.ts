import unplugin from "./index.js";

/**
 * Vite plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import HtoPlugin from "hono-typia-openapi/plugin/vite";
 *
 * export default defineConfig({
 *   plugins: [
 *     HtoPlugin({
 *       title: "My API",
 *       appFile: `${__dirname}/src/app.ts`,
 *       output: `${__dirname}/swagger.json`,
 *       tsconfig: `${__dirname}/tsconfig.json`,
 *     }),
 *   ],
 * }),
 */
export default unplugin.vite;
