export { InvalidTypeError } from "./errors/InvalidTypeError.js";
export { type HtoConfig, type HtoGenerateOptions } from "./options.js";

import ts from "typescript";
import { generateOpenApiDocs } from "./generateOpenApiDocs.js";
import { type HtoConfig } from "./options.js";

export function createTsProgram(config: Required<HtoConfig>) {
  const { options: compilerOptions } = ts.parseJsonConfigFileContent(
    ts.readConfigFile(config.tsconfig, ts.sys.readFile).config,
    ts.sys,
    config.title,
  );
  compilerOptions.noEmit = true;
  const program = ts.createProgram([config.appFile], compilerOptions);
  return program;
}

export function createTsWatchProgram(config: Required<HtoConfig>) {
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

// function shouldBePretty(options: ts.CompilerOptions) {
//   if (!options || typeof options.pretty === "undefined") {
//     return (
//       !!ts.sys.writeOutputIsTTY &&
//       ts.sys.writeOutputIsTTY() &&
//       !sys.getEnvironmentVariable("NO_COLOR")
//     );
//   }
//   return options.pretty;
// }
