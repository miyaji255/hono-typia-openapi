import ts from "typescript";
import * as path from "path";
import { generateOpenAPIDocs as coreMain } from "../src/core";
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

  const result = coreMain(program, fileName, "AppType");
  if (result !== undefined)
    await writeFile(
      path.resolve(__dirname, "../samples/swagger.json"),
      JSON.stringify(result, null, 2),
      "utf-8",
    );
}

main().catch(console.error);
