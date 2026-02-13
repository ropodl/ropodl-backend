import type { Context, Next } from 'hono';
import { decode } from 'hono/jwt';
import { error } from '../utils/error.js';

interface UserPayload {
  id: number;
  username: string;
}

export const authenticate = async (c: Context, next: Next) => {
  const authorization = c.req.header('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return error(c, 'Authorization Headers Missing', 400);
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = decode(token).payload as unknown as UserPayload;
    c.set('user', payload);
    return next();
  } catch (e) {
    return error(c, 'Invalid Token', 401);
  }
};

