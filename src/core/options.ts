export interface HtoOptions {
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

export interface HtoCliOptions extends HtoOptions {
  /**
   * The path to the output swagger file.
   */
  output: string;

  /**
   * The path to the tsconfig file.
   */
  tsconfig: string;
}
