import ts from "typescript";
import * as path from "path";
import { generateOpenApiDocs } from "../src/core/index.js";
import { writeFile } from "fs/promises";

async function main() {
  const { options: compilerOptions } = ts.parseJsonConfigFileContent(
    ts.readConfigFile(
      path.resolve(__dirname, "../tsconfig.test-app.json"),
      ts.sys.readFile,
    ).config,
    ts.sys,
    "app1",
  );

  const fileName = path.resolve(__dirname, "../samples/app1.ts");
  const program = ts.createProgram([fileName], compilerOptions);

  const result = generateOpenApiDocs(program, {
    title: "app",
    version: "1.0.0",
    description: "",
    openapi: "3.1",
    appFile: fileName,
    appType: "AppType",
  });
  if (result !== undefined)
    await writeFile(
      path.resolve(__dirname, "../samples/app1-docs.json"),
      JSON.stringify(result, null, 2),
      "utf-8",
    );
}

main().catch(console.error);
