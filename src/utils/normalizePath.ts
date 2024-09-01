/** @internal */
export function normalizePath(path: string) {
  return path
    .split("/")
    .map((p) => {
      if (!p.startsWith(":")) return p;

      const regexIndex = p.indexOf("{");
      if (regexIndex === -1) return `{${p.slice(1)}}`;
      return `{${p.slice(1, regexIndex)}}`;
    })
    .join("/");
}
