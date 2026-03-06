import { db } from '../db/db.ts';
import { auditLogSchema } from '../schema/audit_log.ts';

export interface AuditLogData {
  userId: number;
  action: string;
  entity: string;
  entityId?: number;
  details?: any;
  ipAddress?: string;
}

export const logAction = async (data: AuditLogData) => {
  try {
    await db.insert(auditLogSchema).values({
      userId: data.userId,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      details: data.details,
      ipAddress: data.ipAddress,
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};
