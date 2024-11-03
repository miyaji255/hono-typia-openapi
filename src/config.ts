import type { HtoConfig } from "./core/options.js";
export type { HtoConfig };

/* istanbul ignore next -- @preserve */
export function defineConfig<OpenAPI extends "3.1" | "3.0">(
  config: HtoConfig<OpenAPI>,
) {
  return config;
}
