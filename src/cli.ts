import { cosmiconfig } from "cosmiconfig";
import typia from "typia";
import {
  searchTsConfig,
  assertConfig,
  type HtoConfig,
} from "./core/options.js";
import { cac } from "cac";
import { createTsProgram, generateOpenApiDocs } from "./core/index.js";
import * as path from "path";
import ts from "typescript";
import { version as packageVersion } from "./meta.js";
import { consola } from "./utils/log.js";

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
  const config: Partial<HtoConfig<"3.1">> | Partial<HtoConfig<"3.0">> =
    result === null || result.isEmpty
      ? {}
      : typia.assert<HtoConfig<"3.1"> | HtoConfig<"3.0">>(result.config);

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
    "-O, --openapi <openapi>",
    "The version of the OpenAPI specification. ['3.1', '3.0']",
    {
      default: "3.1",
    },
  );
  cli.option("-d, --description <description>", "The description of the API");
  cli.option("-V, --app-version <appVersion>", "The version of the API", {
    default: "1.0.0",
  });
  cli.option("-a, --app-file <appFile>", "The path to the Hono app file");
  cli.option("-n, --app-type <appType>", "Hono app type name", {
    default: "AppType",
  });
  cli.option("-o, --output <output>", "The path to the output swagger file", {
    default: "openapi.json",
  });
  cli.option("--tsconfig <tsconfig>", "The path to the tsconfig file");
  cli.help();

  cli.version(packageVersion);

  const configFromCli = cli.parse(undefined, { run: true }).options;
  if (configFromCli["help"] || configFromCli["version"]) return;

  config.title = configFromCli["title"] || config.title;
  config.openapi =
    (configFromCli["openapi"] === 3.1
      ? "3.1"
      : configFromCli["openapi"] === 3.0
        ? "3.0"
        : (`${configFromCli["openapi"]}` as any)) || config.openapi;
  config.description =
    (configFromCli["description"] || config.description) ?? "";
  config.version = configFromCli["appVersion"] || config.version;
  config.appFile = configFromCli["appFile"]
    ? path.resolve(process.cwd(), configFromCli["appFile"])
    : config.appFile;
  config.appType = configFromCli["appType"] || config.appType;
  config.output = configFromCli["output"]
    ? path.resolve(process.cwd(), configFromCli["output"])
    : config.output;
  config.tsconfig =
    (configFromCli["tsconfig"]
      ? path.resolve(process.cwd(), configFromCli["tsconfig"])
      : config.tsconfig) ?? searchTsConfig();

  assertConfig(config);

  consola.start("Generating OpenAPI docs...");
  const program = createTsProgram(config);

  const openAPIDocs = await generateOpenApiDocs(program, config);
  ts.sys.writeFile(config.output, JSON.stringify(openAPIDocs));

  consola.success("OpenAPI docs generated successfully");
}

main().catch(consola.error);
