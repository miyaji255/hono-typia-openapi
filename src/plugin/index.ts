import { createUnplugin } from "unplugin";
import {
  type HtoConfig,
  searchTsConfig,
  validateOptions,
} from "../core/options.js";
import {
  createTsProgram,
  createTsWatchProgram,
  generateOpenApiDocs,
} from "../core/index.js";
import { writeFile } from "fs/promises";

const unplugin /* #__PURE__ */ = createUnplugin<HtoConfig, false>(
  (config, meta) => {
    config.appType ??= "AppType";
    config.openapi ??= "3.1";
    config.version ??= "1.0.0";
    config.description ??= "";
    config.tsconfig = config.tsconfig ??= searchTsConfig();
    config.output ??= "swagger.json";

    validateOptions(config);

    if (meta.watchMode) {
      const watchProgram = createTsWatchProgram(config);
      return {
        name: "hono-typia-openapi",
        async buildEnd() {
          const program = watchProgram.getProgram().getProgram();
          const docs = generateOpenApiDocs(program, config);
          await writeFile(config.output, JSON.stringify(docs));
        },
      };
    } else {
      return {
        name: "hono-typia-openapi",
        async buildEnd() {
          const program = createTsProgram(config);
          const docs = generateOpenApiDocs(program, config);
          writeFile(config.output, JSON.stringify(docs));
        },
      };
    }
  },
);

export default unplugin;

export type { HtoConfig };
