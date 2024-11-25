/* istanbul ignore next -- @preserve */
/**
 * Error class for invalid type errors.
 */
export class InvalidTypeError extends Error {
  override readonly name: "InvalidTypeError" = "InvalidTypeError";
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }

  static throwIfNullOrUndefined<T>(
    value: T,
    message?: string,
    options?: ErrorOptions,
  ): asserts value is Exclude<T, undefined | null> {
    if (value === undefined || value === null) {
      throw new InvalidTypeError(message, options);
    }
  }
}
