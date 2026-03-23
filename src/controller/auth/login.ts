import { db } from '../../db/db.js';
import { error } from '../../utils/error.js';
import { sign } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { userSchema } from '../../schema/users.js';
import bcrypt from 'bcrypt';
import type { Context } from 'hono';
import { invalidateCache } from '../../utils/cache.js';
import { ADMIN_PERMISSIONS } from '../../constants/permissions.js';

export const login = () => async (c: Context) => {
  const { email, password } = await c.req.json();

  const usersResult = await db
    .select({
      id: userSchema.id,
      username: userSchema.username,
      fullname: userSchema.fullname,
      email: userSchema.email,
      avatar: userSchema.avatar,
      permissions: userSchema.permissions,
      password: userSchema.password,
    })
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);

  if (!usersResult.length) return error(c, 'Email/Password do not match', 404);
  const user = usersResult[0];

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) return error(c, 'Email/Password do not match', 404);

  const payload = {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    email: user.email,
    avatar: user.avatar,
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 1 day
  };

  const token = await sign(payload, <string>process.env.APP_KEY);

  return c.json({
    message: 'Logged in Successfully',
    token,
  });
};

export const setup = () => async (c: Context) => {
  const usersResult = await db.select().from(userSchema).limit(1);

  if (usersResult.length)
    return error(c, 'Initial setup already complete', 400);

  const { username, fullname, email, password } = await c.req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(userSchema)
    .values({
      username,
      fullname,
      email,
      password: hashedPassword,
      permissions: [...ADMIN_PERMISSIONS],
    })
    .returning();

  invalidateCache('admin:stats:dashboard');

  interface user {
    fullname: string;
    username: string;
    email: string;
    password?: string;
  }

  delete (newUser as user).password;

  return c.json({ message: 'User created successfully', user: newUser });
};
