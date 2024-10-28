import ts from "typescript";
import * as path from "path";
import type { HtoGenerateOptions } from "./options.js";
import { analyzeSchema } from "./analyzeSchema.js";

/** @internal */
export function generateOpenApiDocs<OpenAPI extends "3.0" | "3.1" = "3.1">(
  program: ts.Program,
  options: HtoGenerateOptions<OpenAPI>,
) {
  const checker = program.getTypeChecker();

  let honoType: ts.Type | undefined;
  const sourceFile = program.getSourceFile(options.appFile);

  ts.visitEachChild(
    sourceFile,
    (node) => {
      if (
        ts.isTypeAliasDeclaration(node) &&
        node.modifiers &&
        node.modifiers.some(
          (mod) => mod.kind === ts.SyntaxKind.ExportKeyword,
        ) &&
        node.name.text === options.appType
      ) {
        const type = checker.getTypeAtLocation(node);
        if (!isHono(type)) return undefined;
        if (honoType !== undefined) throw new Error("Multiple app types found");
        honoType = type;
      }

      return undefined;
    },
    undefined,
  );
  if (honoType === undefined) throw new Error("App type not found");

  const schemaType = checker.getTypeArguments(honoType as ts.TypeReference)[1]!;

  return analyzeSchema(checker, schemaType, options);
}

function isHono(type: ts.Type) {
  const sourceFile = type.symbol.valueDeclaration!.getSourceFile();
  const absolutePath = path.resolve(sourceFile.fileName);
  return (
    (absolutePath.endsWith(
      path.join("hono", "dist", "types", "hono-base.d.ts"),
    ) ||
      absolutePath.endsWith(path.join("hono", "dist", "types", "hono.d.ts"))) &&
    type.symbol.name === "Hono"
  );
}
