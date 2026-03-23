import type { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { error } from '../utils/error.js';

interface UserPayload {
  id: number;
  username: string;
  permissions: string[];
}

export const authenticate = async (c: Context, next: Next) => {
  const authorization = c.req.header('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return error(c, 'Authorization Headers Missing', 400);
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verify(token, <string>process.env.APP_KEY, 'HS256') as unknown as UserPayload;
    c.set('user', payload);
    return next();
  } catch (e) {
    return error(c, 'Invalid Token', 401);
  }
};

export const authorize = (permission: string) => async (c: Context, next: Next) => {
  const user = c.get('user') as UserPayload;

  if (!user) {
    return error(c, 'Unauthorized', 401);
  }

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];

  if (!permissions.includes(permission)) {
    return error(c, 'Forbidden', 403);
  }

  return next();
};
