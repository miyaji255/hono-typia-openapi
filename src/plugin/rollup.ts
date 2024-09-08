import unplugin, { type HtoConfig } from "./index.js";
export type { HtoConfig };

/**
 * Rollup plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import HtoPlugin from "hono-typia-openapi/rollup";
 *
 * export default {
 *   plugins: [
 *     HtoPlugin({
 *       title: "My API",
 *       appFile: `${__dirname}/src/app.ts`,
 *       output: `${__dirname}/swagger.json`,
 *       tsconfig: `${__dirname}/tsconfig.json`,
 *     })
 *   ],
 * };
 * ```
 */
export default unplugin.rollup;
