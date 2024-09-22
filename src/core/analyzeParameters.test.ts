import { describe, expect, test } from "vitest";
import { createTsTestProgram, getTypeFromSource } from "../test/utils.js";
import { analyzeParamters } from "./analyzeParameters.js";
import { InvalidTypeError } from "./errors/InvalidTypeError.js";

describe("analyzeParameters", () => {
  const program = createTsTestProgram([
    {
      fileName: "test.ts",
      code: `
import { tags } from "typia";
type Type = {
  json: { a: string; b: number };
  form: { c: string; d: number };
  query: { id: string; page: \`\${number}\`; statuses?: string | string[] };
  param: { id: \`\${number & tags.Type<"uint32">}\` };
  header: { token: string };
  cookie: { session: string };
}
`,
    },
    {
      fileName: "only array query.ts",
      code: "type Type = { query: { statuses: string[] } }",
    },
    {
      fileName: "optional only array query.ts",
      code: "type Type = { query: { statuses?: string[] } }",
    },
    {
      fileName: "number query.ts",
      code: "type Type = { query: { id: number } }",
    },
    {
      fileName: "optional param.ts",
      code: "type Type = { param: { id?: string } }",
    },
    {
      fileName: "array param.ts",
      code: "type Type = { param: { id: string | string[] } }",
    },
    {
      fileName: "number param.ts",
      code: "type Type = { param: { id: string | number } }",
    },
    {
      fileName: "number param2.ts",
      code: "type Type = { param: { id: number } }",
    },
    {
      fileName: "array header.ts",
      code: "type Type = { header: { token: string | string[] } }",
    },
    {
      fileName: "number header.ts",
      code: "type Type = { header: { token: string | number } }",
    },
    {
      fileName: "array cookie.ts",
      code: "type Type = { cookie: { session: string | string[] } }",
    },
    {
      fileName: "number cookie.ts",
      code: "type Type = { cookie: { session: string | number } }",
    },
  ]);

  test("should work", () => {
    const checker = program.getTypeChecker();
    const type = getTypeFromSource(
      checker,
      program.getSourceFile("test.ts")!,
      "Type",
    );

    const result = analyzeParamters(checker, {
      query: checker.getTypeOfPropertyOfType(type!, "query"),
      param: checker.getTypeOfPropertyOfType(type, "param"),
      header: checker.getTypeOfPropertyOfType(type, "header"),
      cookie: checker.getTypeOfPropertyOfType(type, "cookie"),
    });

    expect(result.length).toBe(6);

    const queries = result.filter((r) => r.in === "query");
    expect(queries.length).toBe(3);
    for (const query of queries) {
      switch (query.name) {
        case "id":
          expect(query.required).toBe(true);
          expect(checker.typeToString(query.type)).toBe("string");
          expect(query.explode).toBe(false);
          break;
        case "page":
          expect(query.required).toBe(true);
          expect(checker.typeToString(query.type)).toBe("`${number}`");
          expect(query.explode).toBe(false);
          break;
        case "statuses":
          expect(query.required).toBe(false);
          expect(checker.typeToString(query.type)).toBe("string[]");
          expect(query.explode).toBe(true);
          break;
        default:
          expect.fail("Unexpected query parameter");
      }
    }

    const params = result.filter((r) => r.in === "path");
    expect(params.length).toBe(1);
    expect(params[0]!.name).toBe("id");
    expect(params[0]!.required).toBe(true);
    expect(checker.typeToString(params[0]!.type)).toBe(
      '`${number & Type<"uint32">}`',
    );
    expect(params[0]!.explode).toBe(false);

    const headers = result.filter((r) => r.in === "header");
    expect(headers.length).toBe(1);
    expect(headers[0]!.name).toBe("token");
    expect(headers[0]!.required).toBe(true);
    expect(checker.typeToString(headers[0]!.type)).toBe("string");

    const cookies = result.filter((r) => r.in === "cookie");
    expect(cookies.length).toBe(1);
    expect(cookies[0]!.name).toBe("session");
    expect(cookies[0]!.required).toBe(true);
  });

  test.each<[string, string]>([
    [
      "only array query.ts",
      "Query parameter must not be array type. Use `string[] | string` instead.",
    ],
    [
      "optional only array query.ts",
      "Query parameter must not be array type. Use `string[] | string` instead.",
    ],
    [
      "number query.ts",
      "Query parameter must be string type or array of string",
    ],
    ["optional param.ts", "Path parameter must be required"],
    [
      "array param.ts",
      "Path parameter, header or cookie must not be array type",
    ],
    ["number param.ts", "Path parameter, header or cookie must be string type"],
    [
      "number param2.ts",
      "Path parameter, header or cookie must be string type",
    ],
    [
      "array header.ts",
      "Path parameter, header or cookie must not be array type",
    ],
    [
      "number header.ts",
      "Path parameter, header or cookie must be string type",
    ],
    [
      "array cookie.ts",
      "Path parameter, header or cookie must not be array type",
    ],
    [
      "number cookie.ts",
      "Path parameter, header or cookie must be string type",
    ],
  ])("Error - %s", (fileName, expectedErrorMessage) => {
    const checker = program.getTypeChecker();
    const type = getTypeFromSource(
      checker,
      program.getSourceFile(fileName)!,
      "Type",
    );

    expect(() =>
      analyzeParamters(checker, {
        query: checker.getTypeOfPropertyOfType(type, "query"),
        param: checker.getTypeOfPropertyOfType(type, "param"),
        header: checker.getTypeOfPropertyOfType(type, "header"),
        cookie: checker.getTypeOfPropertyOfType(type, "cookie"),
      }),
    ).toThrowError(new InvalidTypeError(expectedErrorMessage));
  });
});
