import unplugin from "./index.js";

/**
 * Rolldown plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // rolldown.config.ts
 * import { defineConfig } from "rolldown";
 * import HtoPlugin from "hono-typia-openapi/plugin/rolldown";
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
export default unplugin.rolldown;
