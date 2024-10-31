import { beforeAll, describe, expect, test } from "vitest";
import { createTsTestProgram, getTypeFromSource } from "../test/utils.js";
import { EXPORT_FOR_TEST } from "./analyzeSchema.js";
import type { DeeplyPartial } from "../types/deeply.js";
import ts from "typescript";

const { analyzeIntercesctionSchemaToRoutes, analyzeUnionSchemaToRoutes } =
  EXPORT_FOR_TEST;

describe("analyzeUnionSchemaToRoutes", () => {
  let program: ts.Program = null as any;
  beforeAll(() => {
    program = createTsTestProgram([
      {
        fileName: "should work.ts",
        code: `
import { tags } from "typia";
interface User {
  readonly id: number & tags.Type<"uint32">;
  name: string;
  age: number & tags.Type<"int32">;
}

type Schema = 
  | {}
  | {
      "/api/user": {
        $get: {
          input: {
            query: { page: string; limit?: string; id?: string[] | string; };
          };
          output: User[];
          outputFormat: "json";
          status: 200;
        };
      };
    } & {
      "/api/user/:id{\\d+}": {
        $get: {
          input: {
            param: { id: string; };
            };
          output: User;
          outputFormat: "json";
          status: 200;
        };
      };
    }
`,
      },
    ]);
  });

  test("should work", () => {
    const checker = program.getTypeChecker();
    const type = getTypeFromSource(
      checker,
      program.getSourceFile("should work.ts")!,
      "Schema",
    );

    const routes = analyzeUnionSchemaToRoutes(checker, type, []);

    expect(routes).toMatchObject([
      {
        path: "/api/user",
        methods: [
          {
            method: "get",
            input: {
              json: undefined,
              form: undefined,
              parameters: [
                {
                  in: "query",
                  name: "page",
                  explode: false,
                  required: true,
                  type: 0,
                },
                {
                  in: "query",
                  name: "limit",
                  explode: false,
                  required: false,
                  type: 1,
                },
                {
                  in: "query",
                  name: "id",
                  explode: true,
                  required: false,
                  type: 2,
                },
              ],
            },
            outputs: {
              200: {
                mediaType: "application/json",
                type: 3,
              },
            },
          },
        ],
      },
      {
        path: "/api/user/{id}",
        methods: [
          {
            method: "get",
            input: {
              json: undefined,
              form: undefined,
              parameters: [
                {
                  in: "path",
                  name: "id",
                  explode: false,
                  required: true,
                  type: 4,
                },
              ],
            },
            outputs: {
              "200": {
                mediaType: "application/json",
                type: 5,
              },
            },
          },
        ],
      },
    ] satisfies DeeplyPartial<(typeof routes)[number]>[]);
  });
});

describe("analyzeIntercesctionSchemaToRoutes", () => {
  let program: ts.Program = null as any;
  beforeAll(() => {
    program = createTsTestProgram([
      {
        fileName: "should work.ts",
        code: `
import { tags } from "typia";

interface User {
  readonly id: number & tags.Type<"uint32">;
  name: string;
  age: number & tags.Type<"int32">;
  }
      
  type Schema = {
  "/api/user": {
    $get: {
      input: {
        query: { page: string; limit?: string; id?: string[] | string; };
      };
      output: User[];
      outputFormat: "json";
      status: 200;
      };
  };
  } & {
  "/api/user/:id{\\d+}": {
    $get: {
      input: {
        param: { id: string; };
        };
      output: User;
      outputFormat: "json";
      status: 200;
    };
  };
  }
  `,
      },
    ]);
  });

  test("should work", () => {
    const checker = program.getTypeChecker();
    const type = getTypeFromSource(
      checker,
      program.getSourceFile("should work.ts")!,
      "Schema",
    );

    const routes = analyzeIntercesctionSchemaToRoutes(checker, type, []);

    expect(routes).toMatchObject([
      {
        path: "/api/user",
        methods: [
          {
            method: "get",
            input: {
              json: undefined,
              form: undefined,
              parameters: [
                {
                  in: "query",
                  name: "page",
                  explode: false,
                  required: true,
                  type: 0,
                },
                {
                  in: "query",
                  name: "limit",
                  explode: false,
                  required: false,
                  type: 1,
                },
                {
                  in: "query",
                  name: "id",
                  explode: true,
                  required: false,
                  type: 2,
                },
              ],
            },
            outputs: {
              200: {
                mediaType: "application/json",
                type: 3,
              },
            },
          },
        ],
      },
      {
        path: "/api/user/{id}",
        methods: [
          {
            method: "get",
            input: {
              json: undefined,
              form: undefined,
              parameters: [
                {
                  in: "path",
                  name: "id",
                  explode: false,
                  required: true,
                  type: 4,
                },
              ],
            },
            outputs: {
              "200": {
                mediaType: "application/json",
                type: 5,
              },
            },
          },
        ],
      },
    ] satisfies DeeplyPartial<(typeof routes)[number]>[]);
  });
});
