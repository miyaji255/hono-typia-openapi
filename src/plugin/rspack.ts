import unplugin from "./index.js";

/**
 * rspack plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // rspack.config.ts
 * const HtoPlugin = require("hono-typia-openapi/plugin/rspack");
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
