import path from "path";
import ts from "typescript";
import { describe, test } from "vitest";
import { main } from ".";
import { writeFile } from "fs/promises";

describe("main", () => {
  test("should work", async () => {
    const { options: compilerOptions } = ts.parseJsonConfigFileContent(
      ts.readConfigFile(
        path.resolve(__dirname, "../tsconfig.test-app.json"),
        ts.sys.readFile,
      ).config,
      ts.sys,
      "app1",
    );

    const program = ts.createProgram(
      [path.resolve(__dirname, "../test/app1.ts")],
      compilerOptions,
    );

    const result = main(program, "AppType");
    if (result === undefined) return;
    await writeFile(
      "./test/swagger.json",
      JSON.stringify(result, null, 2),
      "utf-8",
    );
  });
});
