import { describe, expect, test } from "vitest";
import { parsePath, Path, PathParam } from "./parsePath.js";

describe("normalizePath", () => {
  test.each<[string, string, PathParam[]]>([
    ["/user", "/user", []],
    ["/user/", "/user/", []],
    [
      "/user/:id",
      "/user/{id}",
      [{ name: "id", regex: undefined, optional: false }],
    ],
    [
      "/user/:id/",
      "/user/{id}/",
      [{ name: "id", regex: undefined, optional: false }],
    ],
    [
      "/user/:id{\\d+}",
      "/user/{id}",
      [{ name: "id", regex: "\\d+", optional: false }],
    ],
    [
      "/user/:id{\\d+}/posts",
      "/user/{id}/posts",
      [{ name: "id", regex: "\\d+", optional: false }],
    ],
    [
      "/user/:id{\\d+}/posts/:postId",
      "/user/{id}/posts/{postId}",
      [
        { name: "id", regex: "\\d+", optional: false },
        { name: "postId", regex: undefined, optional: false },
      ],
    ],
  ])("simple path: '%s' => '%s'", (input, output, params) => {
    expect(parsePath(input)).toStrictEqual([{ path: output, params }]);
  });

  test.each<[string, Path[]]>([
    [
      "/user/:id?",
      [
        { path: "/user", params: [] },
        {
          path: "/user/{id}",
          params: [{ name: "id", regex: undefined, optional: true }],
        },
      ],
    ],
    [
      "/user/:id{\\d+}?/posts",
      [
        {
          path: "/user",
          params: [],
        },
        {
          path: "/user/{id}/posts",
          params: [{ name: "id", regex: "\\d+", optional: true }],
        },
      ],
    ],
    [
      "/user/:id{\\d+}?/posts/:postId",
      [
        {
          path: "/user",
          params: [],
        },
        {
          path: "/user/{id}/posts/{postId}",
          params: [
            { name: "id", regex: "\\d+", optional: true },
            { name: "postId", regex: undefined, optional: false },
          ],
        },
      ],
    ],
  ])("optional path: '%s'", (input, output) => {
    expect(parsePath(input)).toStrictEqual(output);
  });
});
