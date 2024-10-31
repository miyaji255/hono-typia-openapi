import ts from "typescript";
import {
  format2mediaType,
  HonoFormats,
  HttpMethod,
  MediaType,
} from "./constants.js";
import { InvalidTypeError } from "./errors/InvalidTypeError.js";
import { analyzeParamters } from "./analyzeParameters.js";
import { isSupportedSchema } from "./createOpenAPISchema.js";

/** @internal */
export interface MethodSchema {
  method: HttpMethod;
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
        mediaType: MediaType | "";
      }
    >
  >;
}

/** @internal */
export function analyzeMethod(
  checker: ts.TypeChecker,
  method: HttpMethod,
  methodType: ts.Type,
  schemaTypes: ts.Type[],
): MethodSchema {
  const responseTypes = methodType.isUnion() ? methodType.types : [methodType];
  // input type is common for all response types
  const inputType = checker.getTypeOfPropertyOfType(responseTypes[0]!, "input");
  InvalidTypeError.throwIfNullOrUndefined(
    inputType,
    "input property not found",
  );

  const inputJsonType = checker.getTypeOfPropertyOfType(inputType, "json");
  const inputFormType = checker.getTypeOfPropertyOfType(inputType, "form");
  const inputQueryType = checker.getTypeOfPropertyOfType(inputType, "query");
  const inputPramType = checker.getTypeOfPropertyOfType(inputType, "param");
  const inputHeaderType = checker.getTypeOfPropertyOfType(inputType, "header");
  const inputCookieType = checker.getTypeOfPropertyOfType(inputType, "cookie");

  const methodSchema: MethodSchema = {
    method,
    input: {
      json:
        inputJsonType !== undefined && isSupportedSchema(inputJsonType)
          ? schemaTypes.push(inputJsonType) - 1
          : undefined,
      form:
        inputFormType !== undefined && isSupportedSchema(inputFormType)
          ? schemaTypes.push(inputFormType) - 1
          : undefined,
      parameters: analyzeParamters(checker, {
        query: inputQueryType,
        param: inputPramType,
        header: inputHeaderType,
        cookie: inputCookieType,
      }).map((param) => ({
        in: param.in,
        name: param.name,
        explode: param.explode,
        type: isSupportedSchema(param.type)
          ? schemaTypes.push(param.type) - 1
          : schemaTypes.push(checker.getStringType()) - 1,
        required: param.required,
      })),
    },
    outputs: {},
  };

  for (const methodType of responseTypes) {
    const outputType = checker.getTypeOfPropertyOfType(methodType, "output");
    const outputFormatType = checker.getTypeOfPropertyOfType(
      methodType,
      "outputFormat",
    );
    const statusType = checker.getTypeOfPropertyOfType(methodType, "status");
    if (
      outputType === undefined ||
      outputFormatType === undefined ||
      statusType === undefined
    )
      throw new Error("Invalid type");

    const status = statusType.isNumberLiteral() ? statusType.value : undefined;
    if (
      outputType.getApparentProperties().length === 0 &&
      !outputFormatType.isStringLiteral() &&
      !statusType.isNumberLiteral()
    ) {
      methodSchema.outputs[204] = {
        mediaType: "",
      };
      continue;
    }

    if (
      outputFormatType.isStringLiteral() &&
      outputFormatType.value === "redirect"
    ) {
      methodSchema.outputs[status ?? "default"] = {
        mediaType: "",
      };
      continue;
    }
    const mediaType =
      outputFormatType.isStringLiteral() &&
      HonoFormats.includes(outputFormatType.value)
        ? format2mediaType[outputFormatType.value]
        : "text/plain";

    if (isSupportedSchema(outputType)) {
      methodSchema.outputs[status ?? "default"] = {
        type: schemaTypes.push(outputType) - 1,
        mediaType,
      };
    } else {
      methodSchema.outputs[status ?? "default"] = {
        mediaType,
      };
    }
  }

  return methodSchema;
}
