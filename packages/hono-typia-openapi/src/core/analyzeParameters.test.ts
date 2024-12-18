import { beforeAll, describe, expect, test } from "vitest";
import { createTsTestProgram, getTypeFromSource } from "../test/utils.js";
import { analyzeParamters } from "./analyzeParameters.js";
import { InvalidTypeError } from "./errors/InvalidTypeError.js";
import ts from "typescript";
import { PathParam } from "./parsePath.js";

describe("analyzeParameters", () => {
  let program: ts.Program = null as any;
  beforeAll(() => {
    program = createTsTestProgram([
      {
        fileName: "test.ts",
        code: `
  import { tags } from "typia";
  type Type = {
    json: { a: string; b: number };
    form: { c: string; d: number };
    query: { id: string; page: \`\${number}\`; statuses?: string | string[] };
    param: { id: \`\${number & tags.Type<"uint32">}\`, page: \`\${number}\`, status?: string };
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
  });

  test("should work", () => {
    const checker = program.getTypeChecker();
    const type = getTypeFromSource(
      checker,
      program.getSourceFile("test.ts")!,
      "Type",
    );

    const result = analyzeParamters(
      checker,
      {
        query: checker.getTypeOfPropertyOfType(type!, "query"),
        param: checker.getTypeOfPropertyOfType(type, "param"),
        header: checker.getTypeOfPropertyOfType(type, "header"),
        cookie: checker.getTypeOfPropertyOfType(type, "cookie"),
      },
      [
        // normal
        { name: "id", optional: false },
        // regex
        { name: "page", regex: "\\d+", optional: false },
        // optional
        { name: "status", optional: true },
        // no schema
        { name: "noSchema", optional: false },
      ],
    );

    expect(result.length).toBe(9);

    const queries = result.filter((r) => r.in === "query");
    expect(queries.length).toBe(3);
    for (const query of queries) {
      switch (query.name) {
        case "id":
          expect(query.required).toBe(true);
          expect(checker.typeToString(query.type!)).toBe("string");
          expect(query.explode).toBe(false);
          break;
        case "page":
          expect(query.required).toBe(true);
          expect(checker.typeToString(query.type!)).toBe("`${number}`");
          expect(query.explode).toBe(false);
          break;
        case "statuses":
          expect(query.required).toBe(false);
          expect(checker.typeToString(query.type!)).toBe("string[]");
          expect(query.explode).toBe(true);
          break;
        default:
          expect.fail("Unexpected query parameter");
      }
    }

    const params = result.filter((r) => r.in === "path");
    expect(params.length).toBe(4);
    expect(params[0]!.name).toBe("id");
    expect(params[0]!.required).toBe(true);
    expect(checker.typeToString(params[0]!.type!)).toBe(
      '`${number & Type<"uint32">}`',
    );
    expect(params[0]!.schema).toBeUndefined();
    expect(params[0]!.explode).toBe(false);

    expect(params[1]).toStrictEqual({
      in: "path",
      name: "page",
      explode: false,
      schema: {
        type: "string",
        pattern: "\\d+",
      },
      required: true,
    });

    expect(params[2]!.name).toBe("status");
    expect(params[2]!.required).toBe(true);
    expect(checker.typeToString(params[2]!.type!)).toBe("string");
    expect(params[2]!.schema).toBeUndefined();
    expect(params[2]!.explode).toBe(false);

    expect(params[3]).toStrictEqual({
      in: "path",
      name: "noSchema",
      explode: false,
      schema: {
        type: "string",
      },
      required: true,
    });

    const headers = result.filter((r) => r.in === "header");
    expect(headers.length).toBe(1);
    expect(headers[0]!.name).toBe("token");
    expect(headers[0]!.required).toBe(true);
    expect(checker.typeToString(headers[0]!.type!)).toBe("string");

    const cookies = result.filter((r) => r.in === "cookie");
    expect(cookies.length).toBe(1);
    expect(cookies[0]!.name).toBe("session");
    expect(cookies[0]!.required).toBe(true);
  });

  test.each<[string, PathParam[], string]>([
    [
      "only array query.ts",
      [],
      "Query parameter must not be array type. Use `string[] | string` instead.",
    ],
    [
      "optional only array query.ts",
      [],
      "Query parameter must not be array type. Use `string[] | string` instead.",
    ],
    [
      "number query.ts",
      [],
      "Query parameter must be string type or array of string",
    ],
    [
      "optional param.ts",
      [{ name: "id", optional: false }],
      "Path parameter must be required",
    ],
    [
      "array param.ts",
      [{ name: "id", optional: false }],
      "Path parameter must not be array type",
    ],
    [
      "number param.ts",
      [{ name: "id", optional: false }],
      "Path parameter must be string type",
    ],
    [
      "number param2.ts",
      [{ name: "id", optional: false }],
      "Path parameter must be string type",
    ],
    [
      "array header.ts",
      [],
      "Path parameter, header or cookie must not be array type",
    ],
    [
      "number header.ts",
      [],
      "Path parameter, header or cookie must be string type",
    ],
    [
      "array cookie.ts",
      [],
      "Path parameter, header or cookie must not be array type",
    ],
    [
      "number cookie.ts",
      [],
      "Path parameter, header or cookie must be string type",
    ],
  ])("Error - %s", (fileName, params, expectedErrorMessage) => {
    const checker = program.getTypeChecker();
    const type = getTypeFromSource(
      checker,
      program.getSourceFile(fileName)!,
      "Type",
    );

    expect(() =>
      analyzeParamters(
        checker,
        {
          query: checker.getTypeOfPropertyOfType(type, "query"),
          param: checker.getTypeOfPropertyOfType(type, "param"),
          header: checker.getTypeOfPropertyOfType(type, "header"),
          cookie: checker.getTypeOfPropertyOfType(type, "cookie"),
        },
        params,
      ),
    ).toThrowError(new InvalidTypeError(expectedErrorMessage));
  });
});
