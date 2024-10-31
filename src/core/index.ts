export { InvalidTypeError } from "./errors/InvalidTypeError.js";
export { type HtoConfig, type HtoGenerateOptions } from "./options.js";

import ts from "typescript";
import { generateOpenApiDocs } from "./generateOpenApiDocs.js";
import { type HtoConfig } from "./options.js";

export function createTsProgram<OpenAPI extends "3.0" | "3.1" = "3.1">(
  config: Required<HtoConfig<OpenAPI>>,
) {
  const { options: compilerOptions } = ts.parseJsonConfigFileContent(
    ts.readConfigFile(config.tsconfig, ts.sys.readFile).config,
    ts.sys,
    config.title,
  );
  compilerOptions.noEmit = true;
  const program = ts.createProgram([config.appFile], compilerOptions);
  return program;
}

export function createTsWatchProgram<OpenAPI extends "3.0" | "3.1" = "3.1">(
  config: Required<HtoConfig<OpenAPI>>,
) {
  const { options: compilerOptions, watchOptions } =
    ts.parseJsonConfigFileContent(
      ts.readConfigFile(config.tsconfig, ts.sys.readFile).config,
      ts.sys,
      config.title,
    );
  compilerOptions.noEmit = true;

  // const reportDiagnostic = ts.createDiagnosticReporter(
  //   ts.sys,
  //   shouldBePretty(compilerOptions),
  // );

  const watchCompilerHost = ts.createWatchCompilerHost(
    [config.appFile],
    compilerOptions,
    ts.sys,
    undefined,
    undefined,
    undefined,
    undefined,
    watchOptions,
  );
  const watchProgram = ts.createWatchProgram(watchCompilerHost);
  return watchProgram;
}

export { generateOpenApiDocs };
