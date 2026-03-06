import type { Context } from 'hono';
import { db } from '../../db/db.ts';
import { auditLogSchema } from '../../schema/audit_log.ts';
import { userSchema } from '../../schema/users.ts';
import { count, eq, desc } from 'drizzle-orm';

export const all = () => async (c: Context) => {
  const limit = Math.min(Number(c.req.query('limit')) || 20, 100);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

  const [logs, countResult] = await Promise.all([
    db
      .select({
        id: auditLogSchema.id,
        action: auditLogSchema.action,
        entity: auditLogSchema.entity,
        entityId: auditLogSchema.entityId,
        ipAddress: auditLogSchema.ipAddress,
        createdAt: auditLogSchema.createdAt,
        username: userSchema.username,
      })
      .from(auditLogSchema)
      .leftJoin(userSchema, eq(auditLogSchema.userId, userSchema.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(auditLogSchema.createdAt)),
    db.select({ total: count(auditLogSchema.id) }).from(auditLogSchema),
  ]);

  const total = countResult[0]?.total || 0;

  return c.json({
    meta: {
      total,
      count: logs.length,
      limit,
      offset,
    },
    data: logs,
  });
};
