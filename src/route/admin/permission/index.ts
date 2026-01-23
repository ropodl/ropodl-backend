import { Hono } from "hono";
import { db } from '../../../db/db.ts';
import { permissions } from '../../../schema/users.ts';
import { isAdmin } from "../../../middleware/admin.ts";
import { all } from "../../../controller/admin/permission/index.ts";

const app = new Hono()

// Permissions
app.get('/', isAdmin, all());

app.post('/', async (c) => {
  const { name, description } = await c.req.json();
  const [newPermission] = await db
    .insert(permissions)
    .values({ name, description })
    .returning();
  return c.json(newPermission);
});

export default app