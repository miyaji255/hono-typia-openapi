/** @internal */
export interface Path {
  readonly path: string;
  readonly params: readonly PathParam[];
}

/** @internal */
export interface PathParam {
  readonly name: string;
  readonly regex?: string;
  /** If the parameter is optional. Allow undefined schema */
  readonly optional: boolean;
}

/**
 * Parse URL path
 *
 * If the path contains an optional parameter, return two paths.
 * @internal
 **/
export function parsePath(path: string): Path[] {
  let normalizedPath = "";
  const parameters: PathParam[] = [];
  const paths: Path[] = [];
  for (const p of path.startsWith("/")
    ? path.split("/").slice(1)
    : path.split("/")) {
    if (p.startsWith(":")) {
      const optional = p.endsWith("?");
      if (optional) {
        // If the path contains an optional parameter, duplicate the path.
        paths.push({ path: normalizedPath, params: [...parameters] });
      }

      const regexIndex = p.indexOf("{");
      normalizedPath +=
        regexIndex < 0
          ? `/{${p.slice(1, optional ? -1 : undefined)}}`
          : `/{${p.slice(1, regexIndex)}}`;
      parameters.push({
        name: p.slice(
          1,
          regexIndex >= 0 ? regexIndex : optional ? -1 : undefined,
        ),
        regex:
          regexIndex >= 0
            ? p.slice(regexIndex + 1, optional ? -2 : -1)
            : undefined,
        optional,
      });
    } else {
      normalizedPath += `/${p}`;
    }
  }
  paths.push({ path: normalizedPath, params: parameters });
  return paths;
}
