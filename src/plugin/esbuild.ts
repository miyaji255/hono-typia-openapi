import unplugin, { type HtoConfig } from "./index.js";
export type { HtoConfig };

/**
 * esbuild plugin for Hono Typia OpenAPI
 *
 * @example
 * ```ts
 * // esbuild.ts
 * import { build } from "esbuild";
 * import HtoPlugin from "hono-typia-openapi/plugin/esbuild";
 *
 * build({
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
export default unplugin.esbuild;
