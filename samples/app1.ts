import typia, { tags } from "typia";
import { Hono } from "hono";
import { typiaValidator } from "@hono/typia-validator";

interface User {
  id: number & tags.Type<"uint32">;
  name: string;
  email: string & tags.Format<"email">;
  age: number & tags.Type<"uint32"> & tags.Minimum<3>;
  enabled: boolean;

  createdAt: string & tags.Format<"date-time">;
  updatedAt: string & tags.Format<"date-time">;
}

interface Article {
  id: number & tags.Type<"uint32">;
  title: string;
  content: string;
  authorId: number & tags.Type<"uint32">;
  email: string & tags.Format<"email">;

  createdAt: string & tags.Format<"date-time">;
  updatedAt: string & tags.Format<"date-time">;
}

export type AppType = typeof app;
export const app = new Hono()
  .get("/docs", (c) => c.text("Hello, World!", 200))
  .basePath("/api")
  .get("/docs", (c) => {
    return c.redirect("/docs");
  })
  .get(
    "/users",
    typiaValidator("cookie", typia.createValidate<{ session: string }>()),
    typiaValidator("header", typia.createValidate<{ authorization: string }>()),
    typiaValidator(
      "query",
      typia.createValidate<{
        name?: string | string[];
        age: `${number & tags.Type<"int32">}`;
      }>(),
      (r, c) => {
        if (r.success) return;
        return c.json(r.errors, 400);
      },
    ),
    (c) => {
      const users: User[] = typia.random<User[]>();

      return c.json(users, 200);
    },
  )
  .post(
    "/users",
    typiaValidator(
      "json",
      typia.createValidate<Omit<User, "id" | "createdAt" | "updatedAt">>(),
      (r, c) => {
        if (r.success) return;
        return c.json(r.errors, 400);
      },
    ),
    (c) => {
      const userData = c.req.valid("json");
      const user: User = {
        id: (Math.random() * 1000) | 0,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return c.json(user, 201);
    },
  )
  .get(
    "/users/:id",
    typiaValidator(
      "param",
      typia.createValidate<{ id: `${number & tags.Type<"uint32">}` }>(),
      (r, c) => {
        if (r.success) return;
        return c.notFound();
      },
    ),
    (c) => {
      const id = c.req.valid("param").id;
      const user: User = typia.random<User>();
      user.id = Number(id);
      return c.json(user, 200);
    },
  )
  .put(
    "/users/:id",
    typiaValidator(
      "param",
      typia.createValidate<{ id: `${number & tags.Type<"uint32">}` }>(),
      (r, c) => {
        if (r.success) return;
        return c.notFound();
      },
    ),
    typiaValidator(
      "json",
      typia.createValidate<Omit<User, "createdAt" | "updatedAt">>(),
      (r, c) => {
        if (r.success) return;
        return c.json(r.errors, 400);
      },
    ),
    (c) => {
      const id = Number(c.req.valid("param").id);
      const userData = c.req.valid("json");
      if (userData.id !== id) {
        return c.json(
          { id: ["id must be the same as the id in the path"] },
          400,
        );
      }
      const user: User = {
        ...userData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return c.json(user, 200);
    },
  )
  .delete(
    "/users/:id",
    typiaValidator(
      "param",
      typia.createValidate<{ id: `${number & tags.Type<"uint32">}` }>(),
      (r, c) => {
        if (r.success) return;
        return c.notFound();
      },
    ),
    (c) => {
      return c.body(null, 204);
    },
  )
  .get("/articles", (c) => {
    const articles: Article[] = typia.random<Article[]>();

    return c.json(articles, 200);
  })
  .post(
    "/articles",
    typiaValidator(
      "json",
      typia.createValidate<Omit<Article, "id" | "createdAt" | "updatedAt">>(),
      (r, c) => {
        if (r.success) return;
        return c.json(r.errors, 400);
      },
    ),
    (c) => {
      const articleData = c.req.valid("json");
      const article: Article = {
        id: (Math.random() * 1000) | 0,
        ...articleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return c.json(article, 201);
    },
  )
  .get(
    "/articles/:id{\\d+}",
    typiaValidator(
      "param",
      typia.createValidate<{ id: `${number & tags.Type<"uint32">}` }>(),
      (r, c) => {
        if (r.success) return;
        return c.notFound();
      },
    ),
    (c) => {
      const id = c.req.valid("param").id;
      const article: Article = typia.random<Article>();
      article.id = Number(id);
      return c.json(article, 200);
    },
  )
  .put(
    "/articles/:id",
    typiaValidator(
      "param",
      typia.createValidate<{ id: `${number & tags.Type<"uint32">}` }>(),
      (r, c) => {
        if (r.success) return;
        return c.notFound();
      },
    ),
    typiaValidator(
      "json",
      typia.createValidate<Omit<Article, "createdAt" | "updatedAt">>(),
      (r, c) => {
        if (r.success) return;
        return c.json(r.errors, 400);
      },
    ),
    (c) => {
      const id = Number(c.req.valid("param").id);
      const articleData = c.req.valid("json");
      if (articleData.id !== id) {
        return c.json(
          { id: ["id must be the same as the id in the path"] },
          400,
        );
      }
      const article: Article = {
        ...articleData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return c.json(article, 200);
    },
  )
  .delete(
    "/articles/:id",
    typiaValidator(
      "param",
      typia.createValidate<{ id: `${number & tags.Type<"uint32">}` }>(),
      (r, c) => {
        if (r.success) return;
        return c.notFound();
      },
    ),
    (c) => {
      return c.body(null, 204);
    },
  );
