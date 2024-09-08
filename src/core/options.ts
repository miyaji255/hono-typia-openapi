import { existsSync } from "fs";
import * as path from "path";
import typia from "typia";

export interface HtoGenerateOptions {
  /**
   * The title of the application.
   */
  title: string;

  /**
   * The version of the OpenAPI specification
   * @default "3.1"
   */
  openapi: "3.1" | "3.0";

  /**
   * The description of the API
   */
  description: string;

  /**
   * The version of the API
   * @default "1.0.0"
   */
  version: string;

  /**
   * The path to the Hono app file
   */
  appFile: string;

  /**
   * Hono app type name
   * @default "AppType"
   */
  appType: string;
}

/**
 * The configuration for the Hono Typia OpenAPI generator.
 */
export interface HtoConfig
  extends Pick<HtoGenerateOptions, "title" | "appFile">,
    Partial<Omit<HtoGenerateOptions, "title" | "appFile">> {
  /**
   * The path to the output swagger file.
   */
  output?: string;

  /**
   * The path to the tsconfig file.
   */
  tsconfig?: string;
}

/** @internal */
export function assertConfig(
  config: unknown,
): asserts config is Required<HtoConfig> {
  typia.assertGuard<Required<HtoConfig>>(config);
}

/** @internal */
export function searchTsConfig(): string {
  let current = process.cwd();
  while (true) {
    const tsConfigPath = path.resolve(current, "tsconfig.json");
    if (existsSync(tsConfigPath)) return tsConfigPath;
    const parent = path.dirname(current);
    if (parent === current) throw new Error("tsconfig.json not found");
    current = parent;
  }
}
