import ts from "typescript";
import * as path from "path";
import type { HtoGenerateOptions } from "./options.js";
import { analyzeSchema } from "./analyzeSchema.js";

/** @internal */
export function generateOpenApiDocs(
  program: ts.Program,
  options: HtoGenerateOptions,
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

  return analyzeSchema(checker, honoType, options);
}

function isHono(type: ts.Type) {
  const sourceFile = type.symbol.valueDeclaration!.getSourceFile();
  return (
    path
      .resolve(sourceFile.fileName)
      .endsWith(path.join("hono", "dist", "types", "hono.d.ts")) &&
    type.symbol.name === "Hono"
  );
}
