import { Hono, Schema } from "hono";
import { OpenAPISpec as OpenAPISpecV30 } from "../openapi/OpenApiV30";
import { OpenAPISpec as OpenAPISpecV31 } from "../openapi/OpenAPIV31";

type ApplicationInfo<OpenAPIVersion extends "3.0" | "3.1"> =
  OpenAPIVersion extends "3.0"
    ? {
        openapi: Pick<OpenAPISpecV30, "info" | "externalDocs">;
      }
    : {
        openapi: Pick<OpenAPISpecV31, "info" | "externalDocs">;
      };

export type Application<
  T extends Hono,
  OpenAPIVersion extends "3.0" | "3.1",
  Info extends ApplicationInfo<OpenAPIVersion>,
> =
  T extends Hono<infer _, infer S>
    ? ApplicationSchema<OpenAPIVersion, S, Info>
    : never;

class ApplicationSchema<
  OpenApiVersion extends "3.0" | "3.1",
  _S extends Schema,
  _Info extends ApplicationInfo<OpenApiVersion>,
> {
  constructor() {
    throw new Error("This is a dummy class for type inference.");
  }
}

const app = new Hono().get("/", (c) => {
  return c.json({ message: "Hello, World!" }, 200);
});

type App = Application<
  typeof app,
  "3.0",
  {
    openapi: {
      info: {
        title: "Hono API";
        version: "1.0.0";
      };
    };
  }
>;
