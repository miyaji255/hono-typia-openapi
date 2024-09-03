# hono-typia-openapi

[![npm version](https://badge.fury.io/js/hono-typia-openapi.svg)](https://badge.fury.io/js/hono-typia-openapi)

This is an Open API Schema Generator for Hono with typia.

## Installation

```bash
npm install hono-typia-openapi
```

## Usage

### Simple Case

```bash
hto -a <app-file> -t <title>
```

And, in &lt;app-file&gt;, you write the following:

```typescript
import { Hono } from "hono";
import typia, { tags } from "typia";
import { typiaValidator } from "@hono/typia-validator";

interface HelloRequest {
  /** Your name */
  name: string & tags.MaxLength<16>;
}

const app = new Hono()
  .get("/hello", (c) => {
    return c.json(200, { message: "Hello, World!" });
  })
  .post(
    "/hello",
    typiaValidator("json", typia.createValidator<HelloRequest>()),
    (c) => {
      const { name } = c.req.valid("json");
      return c.json(200, { message: `Hello, ${name}!` });
    },
  );

// Generator uses this type to get the application schema.
export type AppType = typeof app;
```

Then, you can get the OpenAPI schema in the `swagger.json` file.

### Options

You can specify the following options:

| Option                             | Description                                                             |
| ---------------------------------- | ----------------------------------------------------------------------- |
| -t, --title &lt;title>             | The title of the application                                            |
| -o, --openapi &lt;openapi>         | The version of the OpenAPI specification. ['3.1', '3.0'] (default: 3.1) |
| -d, --description &lt;description> | The description of the API                                              |
| -V, --app-version &lt;version>     | The version of the API                                                  |
| -a, --app-file &lt;appFile>        | The path to the Hono app file                                           |
| -n, --app-type &lt;appType>        | Hono app type name (default: AppType)                                   |
| -o, --output &lt;output>           | The path to the output swagger file                                     |
| -t, --tsconfig &lt;tsconfig>       | The path to the tsconfig file                                           |
| -h, --help                         | Display this message                                                    |
| -v, --version                      | Display version number                                                  |

You can also specify options with a configuration file.

Supported configuration file formats:

- package.json (`hto` field)
- hto.config.json
- hto.config.yaml
- hto.config.yml
- hto.config.js
- hto.config.cjs
- hto.config.mjs
- hto.config.ts

```typescript
import { defineConfig } from "hono-typia-openapi/config";

export default defineConfig({
  title: "My API",
  description: "This is my API",
  version: "1.0.0",
  appFile: "./app.ts",
  appType: "AppType",
  output: "./swagger.json",
  tsconfig: "./tsconfig.json",
});
```

### Show Swagger UI with Hono

You can show the Swagger UI with `@hono/swagger-ui`:

```typescript
import { Hono } from "hono";
import typia, { tags } from "typia";
import { typiaValidator } from "@hono/typia-validator";
import { swaggerUI } from "@hono/swagger-ui";

interface HelloRequest {
  /** Your name */
  name: string & tags.MaxLength<16>;
}

const app = new Hono()
  .get("/hello", (c) => {
    return c.json({ message: "Hello, World!" }, 200);
  })
  .post(
    "/hello",
    typiaValidator("json", typia.createValidator<HelloRequest>()),
    (c) => {
      const { name } = c.req.valid("json");
      return c.json({ message: `Hello, ${name}!` }, 200);
    },
  );

// You can strip this part in production with Dead Code Elimination and Replace Identifiers
if (process.env.NODE_ENV === "development") {
  docs = (await import("fs/promises")).readFile("./swagger.json", "utf-8");
  app
    .get("docs", (c) => c.json(JSON.parse(docs), 200))
    .get("docs/ui", swaggerUI({ url: "/docs" }));
}

export type AppType = typeof app;
```
