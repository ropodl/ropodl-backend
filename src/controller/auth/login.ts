import { db } from "../../db/db.js";
import { error } from "../../utils/error.js";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import { userSchema } from "../../schema/users.js";
import bcrypt from "bcrypt";
import type { Context } from "hono";

export const login = () => async (c: Context) => {
    const { email, password } = await c.req.json();

    const users = await db.select().from(userSchema).where(
        eq(userSchema.email, email)
    ).limit(1);

    if (!users.length) return error(c, 'Email/Password do not match', 404)
    const user = users[0];

    const comparePassword = await bcrypt.compare(password, user.password)
    if (!comparePassword) return error(c, 'Email/Password do not match', 404)

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
}