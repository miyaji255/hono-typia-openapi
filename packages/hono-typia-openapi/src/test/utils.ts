import ts from "typescript";

export function createTsTestProgram(
  codes: { fileName: string; code: string }[],
  compilerOptions?: Partial<ts.CompilerOptions>,
): ts.Program {
  compilerOptions = {
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    isolatedModules: true,
    ...(compilerOptions ?? {}),
  };
  const host = ts.createCompilerHost(compilerOptions);
  const getSourceFile = host.getSourceFile;
  getSourceFile.bind(host);
  host.getSourceFile = (
    fileName,
    languageVersionOrOptions,
    onError,
    shouldCreateNewSourceFile,
  ) => {
    const code = codes.find((c) => c.fileName === fileName)?.code;
    if (code !== undefined) {
      return ts.createSourceFile(fileName, code, ts.ScriptTarget.ESNext);
    }
    return getSourceFile(
      fileName,
      languageVersionOrOptions,
      onError,
      shouldCreateNewSourceFile,
    );
  };
  const program = ts.createProgram(
    codes.map(({ fileName }) => fileName),
    compilerOptions,
    host,
  );

  return program;
}

export function createTsTestType(
  code: string,
  typeAiliasName: string,
  compilerOptions?: Partial<ts.CompilerOptions>,
): {
  checker: ts.TypeChecker;
  type: ts.Type;
  getProperty: (type: ts.Type, name: string) => ts.Type | undefined;
} {
  const fileName = "test.ts";
  const program = createTsTestProgram([{ code, fileName }], compilerOptions);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName);
  let targetNode: ts.TypeAliasDeclaration | undefined;
  ts.visitEachChild(
    sourceFile,
    (node) => {
      if (
        ts.isTypeAliasDeclaration(node) &&
        node.name.text === typeAiliasName
      ) {
        if (targetNode !== undefined)
          throw new Error("Multiple app types found");
        targetNode = node;
      }

      return undefined;
    },
    undefined,
  );
  if (targetNode === undefined) throw new Error("Type not found");

  return {
    checker,
    type: checker.getTypeAtLocation(targetNode.type),
    getProperty: (type, name) => checker.getTypeOfPropertyOfType(type, name),
  };
}

export function getTypeFromSource(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  typeName: string,
) {
  let targetNode: ts.TypeAliasDeclaration | undefined;
  ts.visitEachChild(
    sourceFile,
    (node) => {
      if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
        if (targetNode !== undefined)
          throw new Error("Multiple app types found");
        targetNode = node;
      }

      return undefined;
    },
    undefined,
  );
  if (targetNode === undefined) throw new Error("Type not found");

  return checker.getTypeAtLocation(targetNode.type);
}

export type HonoVersion = "4.5" | "4.6.2" | "4.6";
export function getVersioningPaths(version: HonoVersion) {
  const suffix = version.replaceAll(".", "");
  return {
    hono: [`./node_modules/hono_${suffix}/dist/types/index.d.ts`],
    "hono/hono-base": [
      `./node_modules/hono_${suffix}/dist/types/hono-base.d.ts`,
    ],
    "hono/tiny": [`./node_modules/hono_${suffix}/dist/types/preset/tiny.d.ts`],
    "hono/quick": [
      `./node_modules/hono_${suffix}/dist/types/preset/quick.d.ts`,
    ],
    "hono/types": [`./node_modules/hono_${suffix}/dist/types/types.d.ts`],
    "hono/http-exception": [
      `./node_modules/hono_${suffix}/dist/types/http-exception.d.ts`,
    ],
  };
}
