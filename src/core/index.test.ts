import path from "path";
import ts from "typescript";
import { describe, expect, test } from "vitest";
import { generateOpenApiDocs } from "./index.js";

describe("main", () => {
  test.each([
    "app1",
    // "app2", // typia does not support pertternProperties, so this test will fail
  ])("should work %s", async (sampleName) => {
    const { options: compilerOptions } = ts.parseJsonConfigFileContent(
      ts.readConfigFile(
        path.resolve(__dirname, "../tsconfig.test-app.json"),
        ts.sys.readFile,
      ).config,
      ts.sys,
      sampleName,
    );

    const fileName = path.resolve(__dirname, `../../samples/${sampleName}.ts`);
    const program = ts.createProgram([fileName], compilerOptions);

    const result = generateOpenApiDocs(program, {
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
