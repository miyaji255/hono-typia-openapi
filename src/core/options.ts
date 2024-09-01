export interface HtoOptions {
  /**
   * The title of the application.
   */
  title: string;
  /**
   * The version of the OpenAPI specification
   * @default "3.1"
   */
  openapiVer?: "3.1" | "3.0";
  description?: string;
  /**
   * The version of the API
   * @default "1.0.0"
   */
  version?: string;

  /**
   * The path to the Hono app file
   */
  appFilePath: string;

  /**
   * The name of the application of Hono
   * @default "AppType"
   */
  appTypeName?: string;

  /**
   * The path to the output file.
   */
  swaggerPath?: string;

  /**
   * The path to the tsconfig file.
   */
  tsconfig?: string;
}
