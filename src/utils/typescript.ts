import { Symbol, SymbolFlags } from "typescript";

/** @internal */
export function isOptionalProperty(propertySymbol: Symbol): boolean {
  return (propertySymbol.flags & SymbolFlags.Optional) !== 0;
}
