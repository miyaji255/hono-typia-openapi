import { Context, TypedResponse } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { JSONValue } from "hono/utils/types";

type HeaderRecord = Record<string, string | string[]>;

export function json<T extends JSONValue, const Status extends StatusCode>(
  c: Context,
  stringify: (value: T) => string,
  value: T,
  status: Status,
  headers?: HeaderRecord,
): Response & TypedResponse<T, Status, "json"> {
  return c.newResponse(
    stringify(value),
    status,
    headers
      ? { ...headers, "Content-Type": "application/json; UTF-8" }
      : { "Content-Type": "application/json; UTF-8" },
  ) as any;
}

export function noContent(
  c: Context,
  headers?: HeaderRecord,
): Response & TypedResponse<undefined, 204, "noContent"> {
  return c.newResponse(undefined, 204, headers) as any;
}
