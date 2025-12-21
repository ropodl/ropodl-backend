import { Hono } from "hono";
import { userSchema, roles } from "../../schema/users.js";
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
  const usersResult = await db.select()
    .from(userSchema)
    .limit(1);

  if (usersResult.length) return error(c, "Initial setup already complete", 400);

  const { username, fullname, email, password } = await c.req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check for admin role
  let [adminRole] = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
  if (!adminRole) {
    [adminRole] = await db.insert(roles).values({
      name: 'admin',
      description: 'Super administrator with all permissions'
    }).returning();
  }

  const [newUser] = await db
    .insert(userSchema)
    .values({
      username,
      fullname,
      email,
      password: hashedPassword,
      roleId: adminRole.id
    })
    .returning();

  return c.json({ message: "Admin user created successfully", user: newUser });
});

app.get("/me", isAdmin, async (c) => {
  const user = await c.get<any>("user")
  return c.json(user)
})

export default app;
