import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Seeder } from './Seeder.ts';
import { roles, permissions, rolePermissions } from '../schema/users.ts';

export class RoleSeeder extends Seeder {
  async run(db: NodePgDatabase<Record<string, never>>): Promise<void> {
    console.log('Seeding roles...');

    const rolesData = [
      { name: 'admin', description: 'Administrator' },
      { name: 'user', description: 'Standard User' },
    ];

    await db.insert(roles).values(rolesData).onConflictDoNothing().execute();

    // Assign all permissions to super admin
    const superAdminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'admin'))
      .execute();
    const allPermissions = await db.select().from(permissions).execute();

    if (superAdminRole.length > 0 && allPermissions.length > 0) {
      const roleId = superAdminRole[0].id;
      const rolePerms = allPermissions.map((perm) => ({
        roleId: roleId,
        permissionId: perm.id,
      }));

      await db
        .insert(rolePermissions)
        .values(rolePerms)
        .onConflictDoNothing()
        .execute();
    }
  }
}
