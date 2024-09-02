import { cosmiconfig } from "cosmiconfig";
import typia from "typia";
import { HtoOptions } from "./core/options.js";
import { HtoOptions as HtoConfigOptions } from "./config.js";
import { cac } from "cac";
import { generateOpenAPIDocs } from "./core/index.js";
import * as path from "path";
import ts from "typescript";
import { existsSync } from "fs";
import { version as packageVersion } from "./meta.js";

const explorer = cosmiconfig("hto", {
  searchPlaces: [
    "package.json",
    "hto.config.json",
    "hto.config.yaml",
    "hto.config.yml",
    "hto.config.js",
    "hto.config.cjs",
    "hto.config.mjs",
    "hto.config.ts",
  ],
  searchStrategy: "project",
});

async function main() {
  const result = await explorer.search();
  const config: Partial<HtoOptions> =
    result === null || result.isEmpty
      ? {}
      : typia.assert<HtoConfigOptions>(result.config);

  if (result !== null) {
    const dirname = path.dirname(result.filepath);
    if (config.appFilePath !== undefined)
      config.appFilePath = path.resolve(dirname, config.appFilePath);
    if (config.swaggerPath !== undefined)
      config.swaggerPath = path.resolve(dirname, config.swaggerPath);
    if (config.tsconfig !== undefined)
      config.tsconfig = path.resolve(dirname, config.tsconfig);
  }

  const cli = cac("hto");

  cli.option("-t, --title <title>", "The title of the application");
  cli.option(
    "-o, --openapi-ver <openapiVer>",
    "The version of the OpenAPI specification",
    {
      default: "3.1",
    },
  );
  cli.option("-d, --description <description>", "The description of the API");
  cli.option("--app-version <version>", "The version of the API");
  cli.option(
    "-a, --app-file-path <appFilePath>",
    "The path to the Hono app file",
  );
  cli.option(
    "-n, --app-type-name <appTypeName>",
    "The name of the application of Hono",
    {
      default: "AppType",
    },
  );
  cli.option("-s, --swagger-path <swaggerPath>", "The path to the output file");
  cli.option("-c, --tsconfig <tsconfig>", "The path to the tsconfig file");
  cli.help();

  cli.version(packageVersion);

  const configFromCli = cli.parse(undefined, { run: true }).options;
  if (configFromCli["help"] || configFromCli["version"]) return;

  config.title = configFromCli["title"] || config.title;
  config.openapiVer = configFromCli["openapiVer"] || config.openapiVer;
  config.description =
    (configFromCli["description"] || config.description) ?? "";
  config.version = configFromCli["appVersion"] || config.version;
  config.appFilePath = configFromCli["appFilePath"]
    ? path.resolve(process.cwd(), configFromCli["appFilePath"])
    : config.appFilePath;
  config.appTypeName = configFromCli["appTypeName"] || config.appTypeName;
  config.swaggerPath = configFromCli["swaggerPath"]
    ? path.resolve(process.cwd(), configFromCli["swaggerPath"])
    : config.swaggerPath;
  config.tsconfig =
    (configFromCli["tsconfig"]
      ? path.resolve(process.cwd(), configFromCli["tsconfig"])
      : config.tsconfig) ?? searchTsConfig();
  validateOptions(config);

  const { options: compilerOptions } = ts.parseJsonConfigFileContent(
    ts.readConfigFile(config.tsconfig, ts.sys.readFile).config,
    ts.sys,
    config.title,
  );
  const program = ts.createProgram([config.appFilePath], compilerOptions);

  const openAPIDocs = generateOpenAPIDocs(program, config);
  ts.sys.writeFile(config.swaggerPath, JSON.stringify(openAPIDocs));
  console.log("OpenAPI docs generated successfully");
}

main().catch(console.error);

function validateOptions(
  options: Partial<HtoOptions>,
): asserts options is Required<HtoOptions> {
  if (options.title === undefined) throw new Error("Title is required");
  if (options.appFilePath === undefined)
    throw new Error("App file path is required");

  typia.assert<HtoOptions>(options);
}

function searchTsConfig(): string {
  let current = process.cwd();
  while (true) {
    const tsConfigPath = path.resolve(current, "tsconfig.json");
    if (existsSync(tsConfigPath)) return tsConfigPath;
    const parent = path.dirname(current);
    if (parent === current) throw new Error("tsconfig.json not found");
    current = parent;
  }
}
