import ts from "typescript";
import * as path from "path";
import type { HtoGenerateOptions } from "./options.js";
import { analyzeSchema } from "./analyzeSchema.js";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { parse as parseSemver, SemVer } from "semver";

/** @internal */
export async function generateOpenApiDocs<
  OpenAPI extends "3.0" | "3.1" = "3.1",
>(program: ts.Program, options: HtoGenerateOptions<OpenAPI>) {
  if (!existsSync(options.appFile))
    throw new Error(`The app file '${options.appFile}' does not found.`);

  const checker = program.getTypeChecker();

  const maybeHonoTypes: { type: ts.Type; declarationPath: string }[] = [];
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
        const hono = maybeHono(type);
        if (hono.isHono)
          maybeHonoTypes.push({ type, declarationPath: hono.declarationPath });
      }

      return undefined;
    },
    undefined,
  );

  if (maybeHonoTypes.length <= 0)
    throw new Error(`The app type '${options.appType}' was not found.`);
  const maybeHonoTypesWithVer = await Promise.all(
    maybeHonoTypes.map(async ({ type, declarationPath }) => {
      return {
        type,
        version: await checkHono(path.dirname(declarationPath)),
      };
    }),
  );
  const honoTypes = maybeHonoTypesWithVer.filter(({ version }) => version);
  if (honoTypes.length <= 0)
    throw new Error(`The app type '${options.appType}' was not found.`);

  if (honoTypes.length > 1) throw new Error(`Multiple app types found.`);

  const schemaType = checker.getTypeArguments(
    honoTypes[0]!.type as ts.TypeReference,
  )[1]!;

  return analyzeSchema(checker, schemaType, options, honoTypes[0]!.version!);
}

/**
 * Check the type is Hono. Does not check the package name, so you must check package.json.
 *
 * Support:
 * - `hono` /dist/types/hono.d.ts
 * - `hono/hono_base` /dist/types/hono_base.d.ts
 * - `hono/tiny` /dist/types/preset/tiny.d.ts
 * - `hono/quick` /dist/types/preset/quick.d.ts
 */
function maybeHono(
  type: ts.Type,
): { isHono: true; declarationPath: string } | { isHono: false } {
  const sourceFile = type.symbol.valueDeclaration!.getSourceFile();
  const declarationPath = path.resolve(sourceFile.fileName);

  if (
    (declarationPath.endsWith(path.join("dist", "types", "hono-base.d.ts")) ||
      declarationPath.endsWith(path.join("dist", "types", "hono.d.ts")) ||
      declarationPath.endsWith(
        path.join("dist", "types", "preset", "tiny.d.ts"),
      ) ||
      declarationPath.endsWith(
        path.join("dist", "types", "preset", "quick.d.ts"),
      )) &&
    type.symbol.name === "Hono"
  ) {
    return { isHono: true, declarationPath };
  }
  return { isHono: false };
}

/**
 * Search hono package.json file in the directory recursively and check the `name`.
 * @returns If hono package.json is found, `version`
 */
async function checkHono(directory: string): Promise<SemVer | undefined> {
  while (true) {
    try {
      const packageJson = JSON.parse(
        await readFile(path.join(directory, "package.json"), "utf8"),
      );
      if (packageJson.name === "hono") return parseSemver(packageJson.version)!;
    } catch {}
    const parent = path.dirname(directory);
    if (parent === directory) throw new Error("package.json not found");
    directory = parent;
  }
}
