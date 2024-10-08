import ts from "typescript";
import { HtoGenerateOptions } from "./options.js";
import {
  OpenAPISpec as OpenAPISpecV30,
  PathItemObject,
} from "../openapi/OpenApiV30.js";
import { OpenAPISpec as OpenAPISpecV31 } from "../openapi/OpenApiV31.js";
import { normalizePath } from "../utils/normalize.js";
import { format2mediaType, HttpMethod } from "./constants.js";
import { analyzeMethod } from "./analyzeMethod.js";
import { createOpenAPISchema } from "./createOpenAPISchema.js";

/** @internal */
export function analyzeSchema<OpenAPI extends "3.0" | "3.1" = "3.1">(
  checker: ts.TypeChecker,
  schemaType: ts.Type,
  options: Omit<HtoGenerateOptions<OpenAPI>, "appType" | "appFile">,
): (OpenAPI extends "3.1" ? OpenAPISpecV31 : OpenAPISpecV30) | undefined {
  const { routes, types } = analyzeSchemaToRoutes(checker, schemaType);

  const schema = createOpenAPISchema(options.openapi, checker, types);

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
          requestBody.content["application/x-www-form-urlencoded"] = {
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
    openapi: options.openapi === "3.1" ? "3.1.0" : "3.0.0",
    info: {
      title: options.title,
      description: options.description,
      version: options.version,
    },
    paths,
    components: schema.components as any,
  } as any;
}

/** @internal */
function analyzeSchemaToRoutes(checker: ts.TypeChecker, schemaType: ts.Type) {
  const types: ts.Type[] = [];
  const routes = schemaType
    .getApparentProperties()
    .map(({ name: path }) => {
      const pathType = checker.getTypeOfPropertyOfType(schemaType, path);
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

  return { routes, types } as const;
}

/** @internal */
export const EXPORT_FOR_TEST = {
  analyzeSchemaToRoutes,
};
