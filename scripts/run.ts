import * as ts from "typescript";
import * as path from "path";
import { main } from "../src/core";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const { options: compilerOptions } = ts.parseJsonConfigFileContent(
  ts.readConfigFile(
    path.resolve(dirname, "../tsconfig.test-app.json"),
    ts.sys.readFile,
  ).config,
  ts.sys,
  "app1",
);

const fileName = path.resolve(dirname, "../samples/app1.ts");
const program = ts.createProgram([fileName], compilerOptions);

const result = main(program, fileName, "AppType");
if (result !== undefined)
  await writeFile(
    path.resolve(dirname, "../samples/swagger.json"),
    JSON.stringify(result, null, 2),
    "utf-8",
  );
