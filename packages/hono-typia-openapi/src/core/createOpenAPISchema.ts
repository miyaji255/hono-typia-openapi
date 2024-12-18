import ts from "typescript";
import { MetadataCollection } from "typia/lib/factories/MetadataCollection.js";
import { MetadataFactory } from "typia/lib/factories/MetadataFactory.js";
import { JsonSchemasProgrammer } from "typia/lib/programmers/json/JsonSchemasProgrammer.js";
import type { Metadata } from "typia/lib/schemas/metadata/Metadata.js";

/** @internal */
export function createOpenAPISchema<Version extends "3.0" | "3.1">(
  openapiVersion: Version,
  checker: ts.TypeChecker,
  types: ts.Type[],
) {
  const collection = new MetadataCollection({
    replace: MetadataCollection.replace,
  });

  const results = types.map((t) =>
    MetadataFactory.analyze({
      checker,
      transformer: undefined,
      options: {
        escape: true,
        constant: true,
        absorb: false,
        validate: JsonSchemasProgrammer.validate,
      },
      collection,
      type: t,
    }),
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

  return JsonSchemasProgrammer.write({
    version: openapiVersion,
    metadatas: results.map((r) => (r as { data: Metadata }).data),
  });
}

/** @internal */
export function isSupportedSchema(type: ts.Type): boolean {
  return (
    (type.flags &
      (ts.TypeFlags.Never | ts.TypeFlags.Undefined | ts.TypeFlags.Null)) ===
    0
  );
}
