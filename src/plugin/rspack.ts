import unplugin, { type HtoConfig } from "./index.js";
export type { HtoConfig };

/* istanbul ignore next -- @preserve */
/**
 * rspack plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // rspack.config.ts
 * const HtoPlugin = require("hono-typia-openapi/rspack");
 *
 * module.exports = {
 *   plugins: [
 *     HtoPlugin({
 *       title: "My API",
 *       appFile: `${__dirname}/src/app.ts`,
 *       output: `${__dirname}/swagger.json`,
 *       tsconfig: `${__dirname}/tsconfig.json`,
 *     }),
 *   ],
 * };
 * ```
 */
export default unplugin.rspack;
