import path from "path";
import ts from "typescript";
import { describe, expect, test } from "vitest";
import { generateOpenAPIDocs } from "./index.js";
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

    const fileName = path.resolve(dirname, "../../samples/app1.ts");
    const program = ts.createProgram([fileName], compilerOptions);

    const result = generateOpenAPIDocs(program, {
      title: "app",
      version: "1.0.0",
      description: "",
      openapiVer: "3.1",
      tsconfig: path.resolve(__dirname, "../tsconfig.test-app.json"),
      swaggerPath: path.resolve(__dirname, "../../samples/swagger.json"),
      appFilePath: fileName,
      appTypeName: "AppType",
    });

    expect(JSON.stringify(result)).toMatchSnapshot();
  });
});
