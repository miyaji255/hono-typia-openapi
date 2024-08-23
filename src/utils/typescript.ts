import { Symbol, SymbolFlags } from "typescript";

export function isOptionalProperty(propertySymbol: Symbol): boolean {
  return (propertySymbol.flags & SymbolFlags.Optional) !== 0;
}
