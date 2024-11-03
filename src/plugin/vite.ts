import unplugin, { type HtoConfig } from "./index.js";
export type { HtoConfig };

/* istanbul ignore next -- @preserve */
/**
 * Vite plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite";
 * import HtoPlugin from "hono-typia-openapi/vite";
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
 * });
 * ```
 */
export default unplugin.vite;
