import ts from "typescript";
import { isOptionalProperty } from "../utils/typescript.js";
import { InvalidTypeError } from "./errors/InvalidTypeError.js";
import { type PathParam } from "./parsePath.js";
import { type SchemaObject } from "../openapi/OpenApiV31.js";

/** @internal */
export type ParameterSchema =
  | {
      in: "query" | "path" | "header" | "cookie";
      name: string;
      explode: boolean;
      type: ts.Type;
      schema?: undefined;
      required: boolean;
    }
  | {
      in: "query" | "path" | "header" | "cookie";
      name: string;
      explode: boolean;
      type?: undefined;
      schema: SchemaObject;
      required: boolean;
    };

/** @internal */
export function analyzeParamters(
  checker: ts.TypeChecker,
  types: {
    query?: ts.Type;
    param?: ts.Type;
    header?: ts.Type;
    cookie?: ts.Type;
  },
  params: readonly PathParam[],
): ParameterSchema[] {
  const result: ParameterSchema[] = [];
  if (types.query) {
    result.push(...createParameterSchema(checker, "query", types.query));
  }
  if (types.param) {
    result.push(...createPathparameterSchema(checker, types.param, params));
  }
  if (types.header) {
    result.push(...createParameterSchema(checker, "header", types.header));
  }
  if (types.cookie) {
    result.push(...createParameterSchema(checker, "cookie", types.cookie));
  }
  return result;
}

function createPathparameterSchema(
  checker: ts.TypeChecker,
  type: ts.Type,
  params: readonly PathParam[],
): ParameterSchema[] {
  return params.map((param) => {
    if (param.regex !== undefined) {
      // Preffer Regex Path over Type
      return {
        in: "path",
        name: param.name,
        explode: false,
        schema: {
          type: "string",
          pattern: param.regex,
        },
        required: true,
      };
    }

    const elementType = checker.getTypeOfPropertyOfType(type, param.name);
    if (elementType === undefined)
      return {
        in: "path",
        name: param.name,
        explode: false,
        schema: {
          type: "string",
        },
        required: true,
      };

    const { type: exactType, isArray } = getExactType(checker, elementType);
    const isOptional = isOptionalProperty(
      checker.getPropertyOfType(type, param.name)!,
    );

    if (isOptional && !param.optional)
      // Allow an optional property, if the path parameter is optional.
      throw new InvalidTypeError("Path parameter must be required");
    if (isArray)
      throw new InvalidTypeError("Path parameter must not be array type");
    if (!checker.isTypeAssignableTo(exactType, checker.getStringType()))
      throw new InvalidTypeError("Path parameter must be string type");

    return {
      in: "path",
      name: param.name,
      explode: false,
      type: exactType,
      required: true,
    };
  });
}

function createParameterSchema(
  checker: ts.TypeChecker,
  key: "query" | "path" | "header" | "cookie",
  type: ts.Type,
): ParameterSchema[] {
  return type.getApparentProperties().map((propertySymbol) => {
    const elementType = checker.getTypeOfPropertyOfType(
      type,
      propertySymbol.name,
    );
    InvalidTypeError.throwIfNullOrUndefined(elementType, "Invalid type");

    const { type: exactType, isArray } = getExactType(checker, elementType);
    const isOptional = isOptionalProperty(propertySymbol);
    if (isOptional && key === "path")
      throw new InvalidTypeError("Path parameter must be required");
    if (isArray && key !== "query")
      throw new InvalidTypeError(
        "Path parameter, header or cookie must not be array type",
      );
    if (
      key !== "query" &&
      !checker.isTypeAssignableTo(exactType, checker.getStringType())
    )
      throw new InvalidTypeError(
        "Path parameter, header or cookie must be string type",
      );
    if (key === "query" && !isArray && checker.isArrayType(exactType)) {
      const elementTypeStr = checker.typeToString(
        checker.getElementTypeOfArrayType(exactType)!,
      );
      throw new InvalidTypeError(
        `Query parameter must not be array type. Use \`${elementTypeStr}[] | ${elementTypeStr}\` instead.`,
      );
    }
    if (
      key === "query" &&
      !checker.isTypeAssignableTo(
        isArray ? checker.getElementTypeOfArrayType(exactType)! : exactType,
        checker.getStringType(),
      )
    )
      throw new InvalidTypeError(
        "Query parameter must be string type or array of string",
      );

    return {
      in: key,
      name: propertySymbol.name,
      explode: isArray,
      type: exactType,
      required: !isOptional,
    };
  });
}

/**
 * Get the exact type of array.
 *
 * - `string | string[]` => `string[]`
 * - `string | undefined` => `string`
 * - `string | undefined | string[]` => `string[]`
 */
function getExactType(
  checker: ts.TypeChecker,
  type: ts.Type,
): { type: ts.Type; isArray: boolean } {
  if (!type.isUnion()) return { type, isArray: false };

  let arrayType: ts.Type;
  let elementType1: ts.Type;
  let elementType2: ts.Type;
  switch (type.types.length) {
    case 2:
      if (type.types[0]!.flags === ts.TypeFlags.Undefined)
        return { type: type.types[1]!, isArray: false };
      else if (type.types[1]!.flags === ts.TypeFlags.Undefined)
        return { type: type.types[0]!, isArray: false };
      else {
        const isArray = isArrayAndElementType(
          checker,
          type.types[0]!,
          type.types[1]!,
        );
        if (!isArray) return { type, isArray: false };
        ({ arrayType, elementType1, elementType2 } = isArray);
        break;
      }
    case 3:
      if (type.types[0]!.flags === ts.TypeFlags.Undefined) {
        const isArray = isArrayAndElementType(
          checker,
          type.types[1]!,
          type.types[2]!,
        );
        if (!isArray) return { type, isArray: false };
        ({ arrayType, elementType1, elementType2 } = isArray);
      } else if (type.types[1]!.flags === ts.TypeFlags.Undefined) {
        const isArray = isArrayAndElementType(
          checker,
          type.types[0]!,
          type.types[2]!,
        );
        if (!isArray) return { type, isArray: false };
        ({ arrayType, elementType1, elementType2 } = isArray);
      } else if (type.types[2]!.flags === ts.TypeFlags.Undefined) {
        const isArray = isArrayAndElementType(
          checker,
          type.types[0]!,
          type.types[1]!,
        );
        if (!isArray) return { type, isArray: false };
        ({ arrayType, elementType1, elementType2 } = isArray);
      } else return { type, isArray: false };
      break;
    default:
      return { type, isArray: false };
  }

  if (
    checker.isTypeAssignableTo(elementType1, elementType2) &&
    checker.isTypeAssignableTo(elementType2, elementType1)
  )
    return { type: arrayType, isArray: true };

  return { type, isArray: false };
}

function isArrayAndElementType(
  checker: ts.TypeChecker,
  type1: ts.Type,
  type2: ts.Type,
): { arrayType: ts.Type; elementType1: ts.Type; elementType2: ts.Type } | null {
  if (checker.isArrayType(type1)) {
    return {
      arrayType: type1,
      elementType1: checker.getElementTypeOfArrayType(type1)!,
      elementType2: type2,
    };
  } else if (checker.isArrayType(type2)) {
    return {
      arrayType: type2,
      elementType1: checker.getElementTypeOfArrayType(type2)!,
      elementType2: type1,
    };
  } else {
    return null;
  }
}
