/**
 * Error class for invalid type errors.
 */
export class InvalidTypeError extends Error {
  override readonly name: "InvalidTypeError" = "InvalidTypeError";
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}
