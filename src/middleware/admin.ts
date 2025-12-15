import type { Context, Next } from "hono";
import { decode } from 'hono/jwt'
import { error } from "../utils/error.js";

export const isAdmin = async(c:Context, next:Next) => {
    const authorization = c.req.header('authorization');

    if(!authorization || !authorization.startsWith('Bearer ')) return error(c, 'Authorization Headers Missing', 400)

    const token = authorization.split(' ')[1];

    const payload = decode(token).payload;

    // remove sensitive data
    delete (payload as any).exp;
    // passing data to controller
    // for less db transaction
    c.set("user", payload);

    if(payload.role === 'admin') return next();
    return error(c, 'Invalid Permission', 401);
}