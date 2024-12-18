import unplugin, { type HtoConfig } from "./index.js";
export type { HtoConfig };

/* istanbul ignore next -- @preserve */
/**
 * Rolldown plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // rolldown.config.ts
 * import { defineConfig } from "rolldown";
 * import HtoPlugin from "hono-typia-openapi/rolldown";
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
