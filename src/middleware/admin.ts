import type { Context, Next } from 'hono';
import { decode } from 'hono/jwt';
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
    const payload = decode(token).payload as unknown as UserPayload;
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

  // If permissions is not set, allow everything (dev mode)
  // or restricted? User said "assuming any user has all permissions if not explicitly restricted" in frontend.
  // I will follow the frontend logic for now but make it slightly stricter.
  if (user.permissions && !user.permissions.includes(permission)) {
    return error(c, 'Forbidden', 403);
  }

  return next();
};

