import {
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const permissions = pgTable('permissions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
});

export const roles = pgTable('roles', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: integer('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    permissionId: integer('permission_id')
      .references(() => permissions.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
    roleIdIdx: index('role_permissions_role_id_idx').on(t.roleId),
    permissionIdIdx: index('role_permissions_permission_id_idx').on(
      t.permissionId
    ),
  })
);

export const userSchema = pgTable(
  'users',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    username: varchar('username', { length: 30 }).notNull().unique(),
    fullname: varchar('full_name', { length: 120 }).notNull(),
    email: varchar('email_address').notNull().unique(),
    avatar: varchar('avatar_url'),
    password: varchar('password').notNull(),
    roleId: integer('role_id').references(() => roles.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    roleIdIdx: index('users_role_id_idx').on(t.roleId),
  })
);
