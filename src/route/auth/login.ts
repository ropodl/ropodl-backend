import { Hono } from "hono";
import { userSchema } from "../../schema/users.js";
import { db } from "../../db/db.js";

const app = new Hono();

// app.post("register", async (c) => {
//   const form = await c.req.json();
//   console.log(form)

//   if(form) console.log("this is atest");
//   // console.log(email, password);
//   return c.json({
  //     ok: "ok",
  //     // response,
  //   });
  // });
  
  app.post("login", async (c) => {
    const { email, password } = await c.req.json();
      const res = await db
        .insert(userSchema)
        .values({ username:'asd',fullname:'asd', email: 'as' }).returning({
          id: userSchema.id,
          username: userSchema.username
        });
  console.log(email, password, res);

  return c.json({
    message: "Logged in Successfully",
  });
});

export default app;
