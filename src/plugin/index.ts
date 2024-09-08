import { createUnplugin } from "unplugin";
import {
  type HtoConfig,
  searchTsConfig,
  assertConfig,
} from "../core/options.js";
import {
  createTsProgram,
  createTsWatchProgram,
  generateOpenApiDocs,
} from "../core/index.js";
import { writeFile } from "fs/promises";
import { consola } from "../utils/log.js";

const unplugin /* #__PURE__ */ = createUnplugin<
  HtoConfig & {
    /**
     * Enable watch mode explicitly.
     *
     * @default false
     */
    watchMode?: boolean;
  },
  false
>((config, meta) => {
  config.appType ??= "AppType";
  config.openapi ??= "3.1";
  config.version ??= "1.0.0";
  config.description ??= "";
  config.tsconfig = config.tsconfig ??= searchTsConfig();
  config.output ??= "swagger.json";

  const watchMode = meta.watchMode ?? config.watchMode ?? false;
  assertConfig(config);

  if (watchMode) {
    consola.start("Watching for changes...");
    const watchProgram = createTsWatchProgram(config);

    return {
      name: "hono-typia-openapi",
      async buildEnd() {
        try {
          const program = watchProgram.getProgram().getProgram();
          const docs = generateOpenApiDocs(program, config);
          await writeFile(config.output, JSON.stringify(docs));
          consola.success("OpenAPI docs generated successfully");
        } catch (e) {
          consola.error("Error generating OpenAPI docs", e);
        }
      },
    };
  } else {
    return {
      name: "hono-typia-openapi",
      async buildEnd() {
        consola.start("Generating OpenAPI docs...");
        try {
          const program = createTsProgram(config);
          const docs = generateOpenApiDocs(program, config);
          await writeFile(config.output, JSON.stringify(docs));
          consola.success("OpenAPI docs generated successfully");
        } catch (e) {
          consola.error("Error generating OpenAPI docs", e);
        }
      },
    };
  }
});

export default unplugin;

export type { HtoConfig };
