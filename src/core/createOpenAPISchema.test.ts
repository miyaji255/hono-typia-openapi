import { describe } from "node:test";
import { createOpenAPISchema } from "./createOpenAPISchema.js";
import { expect, test } from "vitest";
import { createTsTestProgram, getTypeFromSource } from "../test/utils.js";
import { Type } from "typescript";
import ts from "typescript";
import { InvalidTypeError } from "./errors/InvalidTypeError.js";
import { OpenAPISpec as OpenAPISpecV30 } from "../openapi/OpenApiV30.js";

describe("createOpenAPISchema", () => {
  const program = createTsTestProgram([
    {
      fileName: "should work.ts",
      code: `
import { tags } from "typia";

interface User {
  id: number & tags.Type<"uint32">;
  name: string;
  age: number & tags.Type<"int32">;
}

type NumberStr = \`\${number}\`;`,
    },
    {
      fileName: "pattern property key.ts",
      code: `
import { tags } from "typia";

type UUID = string & tags.Format<"uuid">;
type Type = {
  [prop: UUID]: {};
};`,
    },
  ]);
  test("should work", () => {
    const checker = program.getTypeChecker();

    const types: Type[] = [];
    program.getSourceFile("should work.ts")!.forEachChild((node) => {
      if (ts.isInterfaceDeclaration(node)) {
        types.push(checker.getTypeAtLocation(node));
      } else if (ts.isTypeAliasDeclaration(node)) {
        types.push(checker.getTypeAtLocation(node));
      }
    });

    const schema30 = JSON.parse(
      JSON.stringify(createOpenAPISchema("3.0", checker, types)),
    );

    expect(schema30).toStrictEqual({
      version: "3.0",
      schemas: [
        {
          $ref: "#/components/schemas/User",
        },
        {
          pattern: "^([+-]?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)$",
          type: "string",
        },
      ],
      components: {
        schemas: {
          User: {
            nullable: false,
            properties: {
              age: {
                type: "integer",
              },
              id: {
                type: "integer",
              },
              name: {
                type: "string",
              },
            },
            required: ["id", "name", "age"],
            type: "object",
          },
        },
      },
    } satisfies typeof schema30);

    // Pick JSON Value
    const schema31 = JSON.parse(
      JSON.stringify(createOpenAPISchema("3.1", checker, types)),
    );

    expect(schema31).toStrictEqual({
      version: "3.1",
      schemas: [
        {
          $ref: "#/components/schemas/User",
        },
        {
          pattern: "^([+-]?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)$",
          type: "string",
        },
      ],
      components: {
        schemas: {
          User: {
            properties: {
              age: {
                type: "integer",
              },
              id: {
                type: "integer",
              },
              name: {
                type: "string",
              },
            },
            required: ["id", "name", "age"],
            type: "object",
          },
        },
      },
    } satisfies typeof schema31);
  });

  test.each<["3.1" | "3.0", string, string]>([
    ["3.1", "pattern property key.ts", "Failed to analyze type. "],
    ["3.0", "pattern property key.ts", "Failed to analyze type. "],
  ])("Error - %s, %s", (version, fileName, expectedErrorMessage) => {
    const checker = program.getTypeChecker();
    const type = getTypeFromSource(
      checker,
      program.getSourceFile(fileName)!,
      "Type",
    );

    expect(() => createOpenAPISchema(version, checker, [type])).toThrowError(
      new InvalidTypeError(expectedErrorMessage),
    );
  });
});
