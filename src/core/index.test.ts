import path from "path";
import ts from "typescript";
import { describe, expect, test } from "vitest";
import { generateOpenAPIDocs } from "./index.js";
import { fileURLToPath } from "url";

describe("main", () => {
  test.each([
    "app1",
    // "app2" typia does not support pertternProperties, so this test will fail
  ])("should work", async (sampleName) => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const { options: compilerOptions } = ts.parseJsonConfigFileContent(
      ts.readConfigFile(
        path.resolve(__dirname, "../tsconfig.test-app.json"),
        ts.sys.readFile,
      ).config,
      ts.sys,
      "app1",
    );

    const fileName = path.resolve(dirname, `../../samples/${sampleName}.ts`);
    const program = ts.createProgram([fileName], compilerOptions);

    const result = generateOpenAPIDocs(program, {
      title: "app",
      version: "1.0.0",
      description: "",
      openapi: "3.1",
      appFile: fileName,
      appType: "AppType",
    });

    expect(JSON.stringify(result)).toMatchSnapshot();
  });
});
