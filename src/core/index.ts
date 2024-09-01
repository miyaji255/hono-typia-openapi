import * as ts from "typescript";
import * as path from "path";
import { OpenAPISpec, PathItemObject } from "../openapi/OpenApiV30";
import { normalizePath } from "../utils/normalizePath";
import { createOpenAPISchema } from "./createOpenAPISchema";
import { analyzeMethod, MethodSchema } from "./analyzeMethod";
import { format2mediaType, HttpMethod } from "./constants";

export function main(
  program: ts.Program,
  fileName: string,
  appTypeName: string,
) {
  const checker = program.getTypeChecker();

  let targetNode: ts.TypeAliasDeclaration | undefined;
  const sourceFile = program.getSourceFile(fileName);

  ts.visitEachChild(
    sourceFile,
    (node) => {
      if (
        ts.isTypeAliasDeclaration(node) &&
        node.modifiers &&
        node.modifiers.some(
          (mod) => mod.kind === ts.SyntaxKind.ExportKeyword,
        ) &&
        node.name.text === appTypeName
      ) {
        if (targetNode !== undefined)
          throw new Error("Multiple app types found");
        targetNode = node;
      }

      return undefined;
    },
    undefined,
  );
  if (targetNode === undefined) throw new Error("App type not found");

  return hono(checker, checker.getTypeAtLocation(targetNode.type));
}

function hono(
  checker: ts.TypeChecker,
  appType: ts.Type,
): OpenAPISpec | undefined {
  if (!isHono(appType)) return;
  const routeType = checker.getTypeArguments(appType as ts.TypeReference)[1]!;

  const types: ts.Type[] = [];
  const routes = routeType
    .getApparentProperties()
    .map(({ name: path }) => {
      const pathType = checker.getTypeOfPropertyOfType(routeType, path);
      if (pathType === undefined) return null;

      const normalizedPath = normalizePath(path);
      return {
        path: normalizedPath,
        methods: pathType
          .getApparentProperties()
          .map(({ name: method }) => {
            const normalizedMethod = method.slice(1);
            const methodType = checker.getTypeOfPropertyOfType(
              pathType,
              method,
            );
            if (
              !HttpMethod.includes(normalizedMethod) ||
              methodType === undefined
            )
              return null;

            return analyzeMethod(checker, normalizedMethod, methodType, types);
          })
          .filter((s) => s !== null),
      };
    })
    .filter((s) => s !== null);

  const schema = createOpenAPISchema("3.0", checker, types);

  const paths: Record<string, PathItemObject> = {};
  for (const { path, methods } of routes) {
    paths[path] = {};
    for (const { method, input, outputs } of methods) {
      if (!HttpMethod.includes(method)) continue;
      paths[path][method] = {
        responses: {},
      };
      if (input.parameters.length > 0)
        paths[path][method].parameters = input.parameters.map((param) => ({
          in: param.in,
          name: param.name,
          explode: param.explode,
          required: param.required,
          schema: schema.schemas[param.type]!,
        }));

      if (input.form !== undefined || input.json !== undefined) {
        paths[path][method].requestBody = {
          content: {},
        };
        const requestBody = paths[path][method].requestBody;

        if (input.json !== undefined) {
          requestBody.content[format2mediaType.json] = {
            schema: schema.schemas[input.json],
          };
          requestBody.required = true;
        }
        if (input.form !== undefined) {
          requestBody.content[format2mediaType.form] = {
            schema: schema.schemas[input.form],
          };
          requestBody.required = true;
        }
      }

      const responses = paths[path][method].responses!;
      for (const [status, op] of Object.entries(outputs)) {
        if (op === undefined) continue;
        if (op.type === undefined) {
          responses[status] = {
            description: "",
          };
        } else {
          responses[status] = {
            description: "",
            content: {
              [op.mediaType]: {
                schema: schema.schemas[op.type],
              },
            },
          };
        }
      }
    }
  }
  return {
    openapi: "3.0.0",
    info: {
      title: "Hono API",
      version: "1.0.0",
    },
    paths,
    components: schema.components as any,
  };
}

function isHono(type: ts.Type) {
  const sourceFile = type.symbol.valueDeclaration!.getSourceFile();
  return (
    path
      .resolve(sourceFile.fileName)
      .includes(path.join("hono", "dist", "types", "hono.d.ts")) &&
    type.symbol.name === "Hono"
  );
}
