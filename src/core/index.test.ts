import path from "path";
import ts from "typescript";
import { describe, test } from "vitest";
import { generateOpenAPIDocs } from "./index.js";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";

describe("main", () => {
  test("should work", async () => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const { options: compilerOptions } = ts.parseJsonConfigFileContent(
      ts.readConfigFile(
        path.resolve(__dirname, "../tsconfig.test-app.json"),
        ts.sys.readFile,
      ).config,
      ts.sys,
      "app1",
    );

    const fileName = path.resolve(dirname, "../test/app1.ts");
    const program = ts.createProgram([fileName], compilerOptions);

    // const result = main(program, fileName, "AppType");
    // if (result === undefined) return;
    // await writeFile(
    //   "./test/swagger.json",
    //   JSON.stringify(result, null, 2),
    //   "utf-8",
    // );
  });
});
