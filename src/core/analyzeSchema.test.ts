import { describe, test } from "vitest";
import { createTsTestProgram, getTypeFromSource } from "../test/utils.js";
import { analyzeSchema } from "./analyzeSchema.js";

describe("analyzeSchema", () => {
  const program = createTsTestProgram([
    {
      fileName: "should work.ts",
      code: `
interface User {
  readonly id: number & tags.Type<"uint32">;
  name: string;
  age: number & tags.Type<"int32">;
}
      
type Schema = {
  "/api/user": {
    $get: {
      input: {
        query: { page: string; limit; };
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
  test("should work", () => {
    const checker = program.getTypeChecker();
    const type = getTypeFromSource(
      checker,
      program.getSourceFile("should work.ts")!,
      "Schema",
    );

    const result = analyzeSchema(checker, type!, {
      title: "Test",
      openapi: "3.1",
      description: "desc",
      version: "1.0.0",
    });
  });
});
