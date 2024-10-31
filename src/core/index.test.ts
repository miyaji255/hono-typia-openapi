import path from "path";
import ts from "typescript";
import { beforeAll, describe, expect, test } from "vitest";
import { generateOpenApiDocs } from "./index.js";
import { getVersioningPaths } from "../test/utils.js";

type HonoVersion = "4.5" | "4.6.2" | "4.6";

describe("main", () => {
  let samplePrograms: Record<HonoVersion, ts.Program> = null as any;
  beforeAll(async () => {
    const programs: Record<string, ts.Program> = {};
    for (const version of ["4.5", "4.6.2", "4.6"] as const) {
      const { options: compilerOptions } = ts.parseJsonConfigFileContent(
        ts.readConfigFile(
          path.resolve(__dirname, "../../tsconfig.test-app.json"),
          ts.sys.readFile,
        ).config,
        ts.sys,
        path.resolve(__dirname, "../../"),
        {
          paths: getVersioningPaths(version),
        },
      );

      programs[version] = ts.createProgram(
        [
          path.resolve(__dirname, `../../samples/app1.ts`),
          path.resolve(__dirname, `../../samples/app2.ts`),
          path.resolve(__dirname, `../../samples/routes-app.ts`),
        ],
        compilerOptions,
      );
    }
    samplePrograms = programs as any;
  });
  test.each<[string, HonoVersion]>([
    ["app1", "4.5"],
    ["app1", "4.6.2"],
    ["app1", "4.6"],
    // "app2", // typia does not support pertternProperties, so this test will fail
    ["routes-app", "4.5"],
    ["routes-app", "4.6.2"],
    ["routes-app", "4.6"],
  ])("should work %s, version: %s", async (sampleName, version) => {
    const program = samplePrograms[version];
    const fileName = path.resolve(__dirname, `../../samples/${sampleName}.ts`);

    const result = await generateOpenApiDocs(program, {
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
