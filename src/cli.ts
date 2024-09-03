import { cosmiconfig } from "cosmiconfig";
import typia from "typia";
import type { HtoCliOptions } from "./config.js";
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
  const config: Partial<HtoCliOptions> =
    result === null || result.isEmpty
      ? {}
      : typia.assert<HtoCliOptions>(result.config);

  if (result !== null) {
    const dirname = path.dirname(result.filepath);
    if (config.appFile !== undefined)
      config.appFile = path.resolve(dirname, config.appFile);
    if (config.output !== undefined)
      config.output = path.resolve(dirname, config.output);
    if (config.tsconfig !== undefined)
      config.tsconfig = path.resolve(dirname, config.tsconfig);
  }

  const cli = cac("hto");

  cli.option("-t, --title <title>", "The title of the application");
  cli.option(
    "-o, --openapi <openapi>",
    "The version of the OpenAPI specification. ['3.1', '3.0']",
    {
      default: "3.1",
    },
  );
  cli.option("-d, --description <description>", "The description of the API");
  cli.option("-V, --app-version <version>", "The version of the API");
  cli.option("-a, --app-file <appFile>", "The path to the Hono app file");
  cli.option("-n, --app-type <appType>", "Hono app type name", {
    default: "AppType",
  });
  cli.option("-o, --output <output>", "The path to the output swagger file");
  cli.option("-t, --tsconfig <tsconfig>", "The path to the tsconfig file");
  cli.help();

  cli.version(packageVersion);

  const configFromCli = cli.parse(undefined, { run: true }).options;
  if (configFromCli["help"] || configFromCli["version"]) return;

  config.title = configFromCli["title"] || config.title;
  config.openapi = configFromCli["openapi"] || config.openapi;
  config.description =
    (configFromCli["description"] || config.description) ?? "";
  config.version = configFromCli["appVersion"] || config.version;
  config.appFile = configFromCli["appFile"]
    ? path.resolve(process.cwd(), configFromCli["appFile"])
    : config.appFile;
  config.appType = configFromCli["appType"] || config.appType;
  config.output = configFromCli["swaggerPath"]
    ? path.resolve(process.cwd(), configFromCli["output"])
    : config.output;
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
  const program = ts.createProgram([config.appFile], compilerOptions);

  const openAPIDocs = generateOpenAPIDocs(program, config);
  ts.sys.writeFile(config.output, JSON.stringify(openAPIDocs));
  console.log("OpenAPI docs generated successfully");
}

main().catch(console.error);

function validateOptions(
  options: Partial<HtoCliOptions>,
): asserts options is Required<HtoCliOptions> {
  if (options.title === undefined) throw new Error("Title is required");
  if (options.appFile === undefined)
    throw new Error("App file path is required");

  typia.assert<HtoCliOptions>(options);
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
