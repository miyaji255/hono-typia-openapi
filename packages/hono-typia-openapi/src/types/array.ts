declare global {
  /** @internal */
  type Expand<T, U> = T extends U ? U : never;

  /** @internal */
  type ExpandPrimitive<T> = T extends T
    ?
        | Expand<T, string>
        | Expand<T, number>
        | Expand<T, boolean>
        | Expand<T, symbol>
        | Expand<T, bigint>
        | Expand<T, undefined>
        | Expand<T, null>
    : never;

  /** @internal */
  interface Array<T> {
    /**
     * Determines whether an array includes a certain element, returning true or false as appropriate.
     * @param searchElement The element to search for.
     * @param fromIndex The position in this array at which to begin searching for searchElement.
     */
    includes(
      searchElement: T | ExpandPrimitive<T>,
      fromIndex?: number,
    ): searchElement is T;
  }

  /** @internal */
  interface ReadonlyArray<T> {
    /**
     * Determines whether an array includes a certain element, returning true or false as appropriate.
     * @param searchElement The element to search for.
     * @param fromIndex The position in this array at which to begin searching for searchElement.
     */
    includes(
      searchElement: T | ExpandPrimitive<T>,
      fromIndex?: number,
    ): searchElement is T;
  }
}

export {};
