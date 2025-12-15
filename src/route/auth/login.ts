import { Hono } from "hono";
import { userSchema } from "../../schema/users.js";
import { db } from "../../db/db.js";
import { eq } from "drizzle-orm";
import * as bcrypt from 'bcrypt';
import { error } from "../../utils/error.js";
import { sign } from "hono/jwt";
import { isAdmin } from "../../middleware/admin.js";

const app = new Hono();

app.post("setup", async (c) => {
  const users = await db.select().from(userSchema)
  .where(
    eq(userSchema.role, "admin")
  ).limit(1);
  if(users.length) return c.text("404 Not Found");
  
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
  
  app.post("login", async (c) => {
    const { email, password } = await c.req.json();

    const users = await db.select().from(userSchema).where(
      eq(userSchema.email, email)
    ).limit(1);
    
    if(!users.length) return error(c, 'Email/Password do not match', 404)
    const user = users[0];
  
  const comparePassword = await bcrypt.compare(password, user.password)
  if(!comparePassword) return error(c, 'Email/Password do not match', 404)
    
    const payload = {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          avatar: null,
          role: user.role,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Token expires in 1 day
        }

    const token = await sign(payload, <string>process.env.APP_KEY)
    
    return c.json({
      message: "Logged in Successfully",
      token
    });
});

app.get("/me", isAdmin, async (c)=>{
  const user = await c.get<any>("user")
  console.log(user, "this is user info")
  return c.json({
    "hi":"hi"
  })
})

export default app;
