import ts from "typescript";
import { IJsonApplication } from "typia";
import { MetadataCollection } from "typia/lib/factories/MetadataCollection.js";
import { MetadataFactory } from "typia/lib/factories/MetadataFactory.js";
import { JsonApplicationProgrammer } from "typia/lib/programmers/json/JsonApplicationProgrammer.js";
import type { Metadata } from "typia/lib/schemas/metadata/Metadata.js";

export function createOpenAPISchema<Version extends "3.0" | "3.1">(
  openapiVersion: Version,
  checker: ts.TypeChecker,
  types: ts.Type[],
) {
  const collection = new MetadataCollection({
    replace: MetadataCollection.replace,
  });

  const results = types.map((t) =>
    MetadataFactory.analyze(checker)({
      escape: true,
      constant: true,
      absorb: false,
      validate: JsonApplicationProgrammer.validate,
    })(collection)(t),
  );
  if (results.some((r) => !r.success)) {
    throw new Error(
      `Failed to analyze type. ${results
        .filter((r) => !r.success)
        .flatMap((r) => r.errors)
        .flatMap((e) => e.messages)
        .join("\n")}`,
    );
  }

  return JsonApplicationProgrammer.write(openapiVersion)(
    results.map((r) => (r as { data: Metadata }).data),
  ) as IJsonApplication<Version>;
}
