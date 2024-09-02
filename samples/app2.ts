import { Hono } from "hono";
import { tags } from "typia";

type UUID = string & tags.Format<"uuid">;
type Context = {
  [prop: UUID]: {};
};
const app = new Hono().get("/some", async function context(c) {
  return c.json({} as Context);
});

export type AppType = typeof app;
