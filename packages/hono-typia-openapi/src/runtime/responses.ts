import { Context, TypedResponse } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { JSONValue } from "hono/utils/types";

type HeaderRecord = Record<string, string | string[]>;

/**
 * Respond with a JSON object.
 *
 * @example
 * ```ts
 * app.get('/api', (c) => {
 *   return jsonT(c, typia.createStringify<User>(), user, 200)
 * })
 * ```
 *
 * @param c Hono context
 * @param stringify `JSON.stringify`-like function. Usually created by `typia.createStringify<T>()`.
 * @param value The JSON object to be included in the response body.
 * @param status The HTTP status code.
 * @param headers An optional record of headers to include in the response.
 */
export function jsonT<T extends JSONValue, const Status extends StatusCode>(
  c: Context,
  stringify: (value: T) => string,
  value: T,
  status: Status,
  headers?: HeaderRecord,
): Response & TypedResponse<T, Status, "json">;

/**
 * Respond with a JSON object.
 *
 * @example
 * ```ts
 * app.get('/api', (c) => {
 *  return jsonT(c, typia.createStringify<User>(), user, { status: 200, headers: { "X-User-Id": user.id } })
 * })
 * ```
 *
 * @param c Hono context
 * @param stringify `JSON.stringify`-like function. Usually created by `typia.createStringify<T>()`.
 * @param value The JSON object to be included in the response body.
 * @param init The response init object, including the status code.
 */
export function jsonT<T extends JSONValue, const Status extends StatusCode>(
  c: Context,
  stringify: (value: T) => string,
  value: T,
  init: Exclude<ResponseInit, "status"> & { status: Status },
): Response & TypedResponse<T, Status, "json">;

export function jsonT<T extends JSONValue, const Status extends StatusCode>(
  c: Context,
  stringify: (value: T) => string,
  value: T,
  arg: Status | (Exclude<ResponseInit, "status"> & { status: Status }),
  headers?: HeaderRecord,
): Response & TypedResponse<T, Status, "json"> {
  return typeof arg === "number"
    ? (c.newResponse(
        stringify(value),
        arg,
        headers
          ? { ...headers, "Content-Type": "application/json; UTF-8" }
          : { "Content-Type": "application/json; UTF-8" },
      ) as Response & TypedResponse<T, Status, "json">)
    : (c.newResponse(stringify(value), arg.status) as Response &
        TypedResponse<T, Status, "json">);
}

/**
 * Respond without a body.
 *
 * @example
 * ```ts
 * app.get('/api', (c) => {
 *  return noContent(c)
 * })
 * ```
 *
 * @param c Hono context
 * @param headers Additional headers to include in the response.
 */
export function noContent(
  c: Context,
  headers?: HeaderRecord,
): Response & TypedResponse<undefined, 204, "nocontent"> {
  return c.newResponse(undefined, 204, headers) as Response &
    TypedResponse<undefined, 204, "nocontent">;
}
