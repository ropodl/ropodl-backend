import { Hono } from "hono";
import { userSchema } from "../../schema/users.js";
import { db } from "../../db/db.js";

const app = new Hono();

app.post("register", async (c) => {
  const { email, password } = await c.req.json();
  console.log(email, password);
  const response = await db
    .insert(userSchema)
    .values({ username: "Andrew", fullname: "Asdasd asdasd" });
  c.json({
    ok: "ok",
    response,
  });
});

app.post("login", async (c) => {
  const { email, password } = await c.req.json();
  console.log(email, password);

  return c.json({
    message: "Logged in Successfully",
  });
});

export default app;
