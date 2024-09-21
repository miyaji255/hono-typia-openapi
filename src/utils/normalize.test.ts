import { describe, expect, test } from "vitest";
import { normalizePath } from "./normalize.js";

describe("normalizePath", () => {
  test.each([
    ["/user", "/user"],
    ["/user/", "/user/"],
    ["/user/:id", "/user/{id}"],
    ["/user/:id/", "/user/{id}/"],
    ["/user/:id{\\d+}", "/user/{id}"],
  ])("should work: '%s' => '%s'", (input, output) => {
    expect(normalizePath(input)).toBe(output);
  });
});
