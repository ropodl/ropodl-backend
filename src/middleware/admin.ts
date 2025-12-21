import type { Context, Next } from "hono";
import { decode } from 'hono/jwt'
import { error } from "../utils/error.js";

interface UserPayload {
    id: number;
    username: string;
    role: string;
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
        c.set("user", payload);
        return next();
    } catch (e) {
        return error(c, 'Invalid Token', 401);
    }
};

export const hasPermission = (permission: string) => async (c: Context, next: Next) => {
    const user = c.get('user') as UserPayload;
    if (!user) return error(c, 'Unauthorized', 401);

    if (user.role === 'admin' || user.permissions?.includes(permission)) {
        return next();
    }

    return error(c, 'Permission Denied', 403);
};

export const isAdmin = async (c: Context, next: Next) => {
    const user = c.get('user') as UserPayload;
    if (user && user.role === 'admin') return next();

    // If authenticate wasn't called, try to decode here for legacy support
    const authorization = c.req.header('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.split(' ')[1];
        const payload = decode(token).payload as unknown as UserPayload;
        if (payload.role === 'admin') {
            c.set("user", payload);
            return next();
        }
    }

    return error(c, 'Invalid Permission', 401);
};