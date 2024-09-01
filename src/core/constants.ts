export const HttpMethod = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
] as const;

export type HttpMethod = (typeof HttpMethod)[number];

export const format2mediaType = {
  json: "application/json",
  xml: "application/xml",
  html: "text/html",
  text: "text/plain",
  form: "application/x-www-form-urlencoded",
  multipart: "multipart/form-data",
} as const;

export const HonoFormats = Object.keys(
  format2mediaType,
) as (keyof typeof format2mediaType)[];

export type MediaType =
  (typeof format2mediaType)[keyof typeof format2mediaType];
