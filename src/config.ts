import type { HtoOptions } from "./core/options.js";

export interface HtoCliOptions
  extends Pick<HtoOptions, "title" | "appFile">,
    Partial<Omit<HtoOptions, "title" | "appFile">> {
  /**
   * The path to the output swagger file.
   */
  output?: string;

  /**
   * The path to the tsconfig file.
   */
  tsconfig?: string;
}

export function defineConfig(config: HtoCliOptions) {
  return config;
}
