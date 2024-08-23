import * as ts from "typescript";
import * as path from "path";

const { options: compilerOptions } = ts.parseJsonConfigFileContent(
  ts.readConfigFile(
    path.resolve(__dirname, "../tsconfig.test-app.json"),
    ts.sys.readFile,
  ).config,
  ts.sys,
  "app1",
);

const program = ts.createProgram(
  [path.resolve(__dirname, "../src/runtime/index.ts")],
  compilerOptions,
);

const checker = program.getTypeChecker();

let targetNode: ts.TypeAliasDeclaration | undefined;
for (const sourceFile of program.getSourceFiles()) {
  ts.visitEachChild(
    sourceFile,
    (node) => {
      if (
        ts.isTypeAliasDeclaration(node) &&
        node.modifiers &&
        node.modifiers.some(
          (mod) => mod.kind === ts.SyntaxKind.ExportKeyword,
        ) &&
        node.name.text === "App"
      ) {
        if (targetNode !== undefined)
          throw new Error("Multiple app types found");
        targetNode = node;
      }

      return undefined;
    },
    undefined,
  );
}

const type = checker.getTypeAtLocation(targetNode!.type);
