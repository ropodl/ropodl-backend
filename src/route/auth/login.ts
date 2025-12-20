import { Hono } from "hono";
import { userSchema } from "../../schema/users.js";
import { db } from "../../db/db.js";
import { eq } from "drizzle-orm";
import * as bcrypt from 'bcrypt';
import { error } from "../../utils/error.js";
import { sign } from "hono/jwt";
import { isAdmin } from "../../middleware/admin.js";
import { login } from "../../controller/auth/login.js";

const app = new Hono();

app.post("/login", login());

app.post("setup", async (c) => {
  const users = await db.select().from(userSchema)
    .where(
      eq(userSchema.role, "admin")
    ).limit(1);
  if (users.length) return c.text("404 Not Found");

  const { username, fullname, email, password } = await c.req.json();
  const hashedPassword = await bcrypt.hash(password, 10);
  const a = await db
    .insert(userSchema)
    .values({
      username,
      fullname,
      email,
      password: hashedPassword,
      role: 'admin'
    });
  console.log(a)
  return error(c, "404 not found", 404)
});

app.get("/me", isAdmin, async (c) => {
  const user = await c.get<any>("user")
  return c.json(user)
})

export default app;
