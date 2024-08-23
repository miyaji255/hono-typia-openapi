import { JsonApplicationProgrammer } from "typia/lib/programmers/json/JsonApplicationProgrammer";
import * as ts from "typescript";
import { MetadataCollection } from "typia/lib/factories/MetadataCollection";
import { MetadataFactory } from "typia/lib/factories/MetadataFactory";
import * as path from "path";
import { IJsonApplication } from "typia";
import { OpenAPISpec, PathItemObject } from "./OpenApiV30";
import { analyzeParamters } from "./analyzeParameters";
import { normalizePath } from "../utils/normalizePath";

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

function getOpenApi(checker: ts.TypeChecker, types: ts.Type[]) {
  const collection = new MetadataCollection({
    replace: MetadataCollection.replace,
  });

  const results = types
    .map((t) =>
      MetadataFactory.analyze(checker)({
        escape: true,
        constant: true,
        absorb: false,
        validate: JsonApplicationProgrammer.validate,
      })(collection)(t),
    )
    .filter((r) => r.success);

  return JsonApplicationProgrammer.write("3.0")(
    results.map((r) => r.data),
  ) as IJsonApplication<"3.0">;
}

const Methods = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
] as const;
type Method = (typeof Methods)[number];
const format2mediaType = {
  json: "application/json",
  xml: "application/xml",
  html: "text/html",
  text: "text/plain",
  form: "application/x-www-form-urlencoded",
  multipart: "multipart/form-data",
} as const;

function hono(
  checker: ts.TypeChecker,
  appType: ts.Type,
): OpenAPISpec | undefined {
  if (!isHono(appType)) return;
  const routeType = checker.getTypeArguments(appType as ts.TypeReference)[1]!;

  const types: ts.Type[] = [];
  const routes: Record<
    string,
    Partial<
      Record<
        Method,
        {
          input: {
            json?: number;
            form?: number;
            parameters: {
              in: "query" | "path" | "header" | "cookie";
              name: string;
              explode: boolean;
              type: number;
              required: boolean;
            }[];
          };
          /** Key: Status Code */
          outputs: Partial<
            Record<
              number | "default",
              {
                type?: number;
                mediaType:
                  | (typeof format2mediaType)[keyof typeof format2mediaType]
                  | "";
              }
            >
          >;
        }
      >
    >
  > = {};
  for (const { name: path } of routeType.getApparentProperties()) {
    const pathType = checker.getTypeOfPropertyOfType(routeType, path);
    if (pathType === undefined) continue;

    const normalizedPath = normalizePath(path);

    routes[normalizedPath] = {};
    for (const { name: method } of pathType.getApparentProperties()) {
      // method is `$${LowerCase<string>}`
      const normalizedMethod = method.slice(1);
      if (!Methods.includes(normalizedMethod)) continue;
      const methodType = checker.getTypeOfPropertyOfType(pathType, method);
      if (methodType === undefined) continue;

      const responseInfo = methodType.isUnion()
        ? methodType.types
        : [methodType];
      // inputは共通のはず
      const inputType = checker.getTypeOfPropertyOfType(
        responseInfo[0]!,
        "input",
      );
      if (inputType === undefined) throw new Error("Invalid type");

      const inputJsonType = checker.getTypeOfPropertyOfType(inputType, "json");
      const inputFormType = checker.getTypeOfPropertyOfType(inputType, "form");
      const inputQueryType = checker.getTypeOfPropertyOfType(
        inputType,
        "query",
      );
      const inputPramType = checker.getTypeOfPropertyOfType(inputType, "param");
      const inputHeaderType = checker.getTypeOfPropertyOfType(
        inputType,
        "header",
      );
      const inputCookieType = checker.getTypeOfPropertyOfType(
        inputType,
        "cookie",
      );

      routes[normalizedPath][normalizedMethod] = {
        input: {
          json:
            inputJsonType === undefined
              ? undefined
              : types.push(inputJsonType) - 1,
          form:
            inputFormType === undefined
              ? undefined
              : types.push(inputFormType) - 1,
          parameters: analyzeParamters(checker, {
            query: inputQueryType,
            param: inputPramType,
            header: inputHeaderType,
            cookie: inputCookieType,
          }).map((param) => ({
            in: param.in,
            name: param.name,
            explode: param.explode,
            type: types.push(param.type) - 1,
            required: param.required,
          })),
        },
        outputs: {},
      };

      for (const methodType of responseInfo) {
        const outputType = checker.getTypeOfPropertyOfType(
          methodType,
          "output",
        );
        const outputFormatType = checker.getTypeOfPropertyOfType(
          methodType,
          "outputFormat",
        );
        const statusType = checker.getTypeOfPropertyOfType(
          methodType,
          "status",
        );
        if (
          outputType === undefined ||
          outputFormatType === undefined ||
          statusType === undefined
        )
          throw new Error("Invalid type");

        const status = statusType.isNumberLiteral()
          ? statusType.value
          : undefined;
        if (
          outputType.getApparentProperties().length === 0 &&
          !outputFormatType.isStringLiteral() &&
          !statusType.isNumberLiteral()
        ) {
          routes[normalizedPath][normalizedMethod].outputs[204] = {
            mediaType: "",
          };
          continue;
        }

        if (
          outputFormatType.isStringLiteral() &&
          outputFormatType.value === "redirect"
        ) {
          routes[normalizedPath][normalizedMethod].outputs[
            status ?? "default"
          ] = {
            mediaType: "",
          };
          continue;
        }

        routes[normalizedPath][normalizedMethod].outputs[status ?? "default"] =
          {
            type: types.push(outputType) - 1,
            mediaType: outputFormatType.isStringLiteral()
              ? (format2mediaType[
                  outputFormatType.value as keyof typeof format2mediaType
                ] ?? outputFormatType.value)
              : "text/plain",
          };
      }
    }
  }

  const schema = getOpenApi(checker, types);

  const paths: Record<string, PathItemObject> = {};
  for (const [path, methods] of Object.entries(routes)) {
    paths[path] = {};
    for (const [method, { input, outputs }] of Object.entries(methods)) {
      if (!Methods.includes(method)) continue;
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
