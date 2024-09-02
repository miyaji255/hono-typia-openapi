import { HtoOptions as FullFilledHtoOptions } from "./core/options.js";

export type HtoOptions = Pick<FullFilledHtoOptions, "title" | "appFilePath"> &
  Partial<Omit<FullFilledHtoOptions, "title" | "appFilePath">>;

export function defineConfig(config: HtoOptions) {
  return config;
}
