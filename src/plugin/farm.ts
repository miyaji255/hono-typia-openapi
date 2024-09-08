import unplugin from "./index.js";

/**
 * Fram plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // farm.config.ts
 * import { defineConfig } from "@farmfe/core"
 * import HtoPlugin from "hono-typia-openapi/plugin/farm";
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
 * ```
 */
export default unplugin.farm;
