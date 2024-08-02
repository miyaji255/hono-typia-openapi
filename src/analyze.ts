import ts from "typescript";

export interface AnalyzeResult {
  in: "query" | "path" | "header" | "cookie";
  name: string;
  explode: boolean;
  type: ts.Type;
  required: boolean;
}

export function analyzeParamters(
  checker: ts.TypeChecker,
  types: {
    query?: ts.Type;
    param?: ts.Type;
    header?: ts.Type;
    cookie?: ts.Type;
  },
): AnalyzeResult[] {
  const result: AnalyzeResult[] = [];
  if (types.query) {
    result.push(...createPramterObject(checker, "query", types.query));
  }
  if (types.param) {
    result.push(...createPramterObject(checker, "path", types.param));
  }
  if (types.header) {
    result.push(...createPramterObject(checker, "header", types.header));
  }
  if (types.cookie) {
    result.push(...createPramterObject(checker, "cookie", types.cookie));
  }
  return result;
}

function createPramterObject(
  checker: ts.TypeChecker,
  key: "query" | "path" | "header" | "cookie",
  type: ts.Type,
): AnalyzeResult[] {
  return type.getApparentProperties().map(({ name, flags }) => {
    const elementType = checker.getTypeOfPropertyOfType(type, name);
    if (elementType === undefined) throw new Error("Invalid type");
    // console.log(checker.typeToString(elementType))

    const isArray =
      elementType.isUnion() &&
      elementType.types.length === 2 &&
      (checker.isArrayType(elementType.types[0]!) ||
        checker.isArrayType(elementType.types[1]!));

    return {
      in: key,
      name: name,
      explode: isArray,
      type: isArray
        ? checker.isArrayType(elementType.types[0]!)
          ? elementType.types[0]!
          : elementType.types[1]!
        : elementType,
      required: (flags & ts.SymbolFlags.Optional) !== 0,
    };
  });
}
