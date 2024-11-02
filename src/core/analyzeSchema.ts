import ts from "typescript";
import { HtoGenerateOptions } from "./options.js";
import {
  OpenAPISpec as OpenAPISpecV30,
  PathItemObject,
} from "../openapi/OpenApiV30.js";
import { OpenAPISpec as OpenAPISpecV31 } from "../openapi/OpenApiV31.js";
import { parsePath } from "./parsePath.js";
import { format2mediaType, HttpMethod } from "./constants.js";
import { analyzeMethod, MethodSchema } from "./analyzeMethod.js";
import { createOpenAPISchema } from "./createOpenAPISchema.js";
import { SemVer } from "semver";

/**
 * Analyze the schema and generate OpenAPI document.
 * @internal
 **/
export function analyzeSchema<OpenAPI extends "3.0" | "3.1" = "3.1">(
  checker: ts.TypeChecker,
  schemaType: ts.Type,
  options: Omit<HtoGenerateOptions<OpenAPI>, "appType" | "appFile">,
  honoVersion: SemVer,
): (OpenAPI extends "3.1" ? OpenAPISpecV31 : OpenAPISpecV30) | undefined {
  const types: ts.Type[] = [];
  const routes =
    honoVersion.compare("4.6.5") >= 0
      ? analyzeUnionSchemaToRoutes(checker, schemaType, types)
      : analyzeIntercesctionSchemaToRoutes(checker, schemaType, types);

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
          schema:
            param.type !== undefined
              ? schema.schemas[param.type]
              : param.schema,
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

interface Route {
  path: string;
  methods: MethodSchema[];
}

type TypeCollector = ts.Type[];

/**
 * Analyze the schema and gather routes and types.
 * Support Hono >= 4.6.5 (Union Schema)
 *
 * Hono 4.6.5 has changed the schema structure to use the union type.
 * https://github.com/honojs/hono/pull/3443
 * @internal
 **/
function analyzeUnionSchemaToRoutes(
  checker: ts.TypeChecker,
  schemaType: ts.Type,
  typeCollector: TypeCollector,
): Route[] {
  if (schemaType.isUnion()) {
    return schemaType.types.flatMap((type) =>
      analyzeIntercesctionSchemaToRoutes(checker, type, typeCollector),
    );
  }

  return analyzeIntercesctionSchemaToRoutes(checker, schemaType, typeCollector);
}

/**
 * Analyze the schema and gather routes and types.
 * Support Hono <= 4.6.4 (Intercection Schema)
 *
 * Hono 4.6.5 has changed the schema structure to use the union type.
 * https://github.com/honojs/hono/pull/3443
 * @internal
 **/
function analyzeIntercesctionSchemaToRoutes(
  checker: ts.TypeChecker,
  schemaType: ts.Type,
  typeCollector: TypeCollector,
): Route[] {
  const routes = schemaType
    .getApparentProperties()
    .flatMap(({ name: path }) => {
      const pathType = checker.getTypeOfPropertyOfType(schemaType, path);
      if (pathType === undefined) return [];

      return parsePath(path).map(({ path, params }) => ({
        path,
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

            return analyzeMethod(
              checker,
              normalizedMethod,
              methodType,
              params,
              typeCollector,
            );
          })
          .filter((r) => r !== null),
      }));
    });

  return routes;
}

/** @internal */
export const EXPORT_FOR_TEST = {
  analyzeUnionSchemaToRoutes,
  analyzeIntercesctionSchemaToRoutes,
};
