import { Hono } from 'hono';
import { db } from '../../../db/db.js';
import { roles, permissions, rolePermissions } from '../../../schema/users.js';
import { eq, inArray } from 'drizzle-orm';
import { isAdmin, authenticate } from '../../../middleware/admin.js';
import { error } from '../../../utils/error.js';

const app = new Hono();

// All RBAC routes require admin access
app.use('*', authenticate, isAdmin);

// Roles
app.get('/roles', async (c) => {
  const allRoles = await db.select().from(roles);
  return c.json(allRoles);
});

app.post('/roles', async (c) => {
  const { name, description } = await c.req.json();
  const [newRole] = await db
    .insert(roles)
    .values({ name, description })
    .returning();
  return c.json(newRole);
});

app.delete('/roles/:id', async (c) => {
  const id = Number(c.req.param('id'));
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
  await db.delete(roles).where(eq(roles.id, id));
  return c.json({ message: 'Role deleted successfully' });
});

// Permissions
app.get('/permissions', async (c) => {
  const allPermissions = await db.select().from(permissions);
  return c.json(allPermissions);
});

app.post('/permissions', async (c) => {
  const { name, description } = await c.req.json();
  const [newPermission] = await db
    .insert(permissions)
    .values({ name, description })
    .returning();
  return c.json(newPermission);
});

// Role Permissions
app.get('/roles/:id/permissions', async (c) => {
  const id = Number(c.req.param('id'));
  const perms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
    })
    .from(permissions)
    .innerJoin(
      rolePermissions,
      eq(permissions.id, rolePermissions.permissionId)
    )
    .where(eq(rolePermissions.roleId, id));

  return c.json(perms);
});

app.post('/roles/:id/permissions', async (c) => {
  const id = Number(c.req.param('id'));
  const { permissionIds } = await c.req.json(); // Array of IDs

  // First clear existing
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));

  if (permissionIds.length > 0) {
    const values = permissionIds.map((pId: number) => ({
      roleId: id,
      permissionId: pId,
    }));
    await db.insert(rolePermissions).values(values);
  }

  return c.json({ message: 'Permissions updated successfully' });
});

export default app;
