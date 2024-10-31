import { HonoBase as Hono } from "hono/hono-base";
import { tags } from "typia";

interface Message {
  message: string & tags.MinLength<10>;
}

const subsub = new Hono().get("/hello", (c) =>
  c.json<Message>({ message: "Hello World!" }),
);
const sub1 = new Hono()
  .basePath("/sub1")
  .get("/hello", (c) => c.json<Message>({ message: "Hello World!" }));
const sub2 = new Hono()
  .basePath("/sub2")
  .get("/hello", (c) => c.json<Message>({ message: "Hello World!" }))
  .route("/subsub", subsub);

const app = new Hono().route("/", sub1).route("/", sub2);

export type AppType = typeof app;
