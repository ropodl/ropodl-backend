import type { Context } from "hono";
import { db } from "../../../db/db.ts";
import { permissions } from "../../../schema/users.ts";

export const all = () => async(c: Context) => {
  const allPermissions = await db.select().from(permissions);
  return c.json(allPermissions);

}