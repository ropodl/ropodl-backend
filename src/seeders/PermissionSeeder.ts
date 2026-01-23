import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Seeder } from './Seeder.ts';
import { permissions } from '../schema/users.ts';

export class PermissionSeeder extends Seeder {
  async run(db: NodePgDatabase<Record<string, never>>): Promise<void> {
    const perms = [
      { name: 'create.roles', description: 'Can create roles' },
      { name: 'read.roles', description: 'Can read roles' },
      { name: 'update.roles', description: 'Can update roles' },
      { name: 'delete.roles', description: 'Can delete roles' },
      { name: 'create.permissions', description: 'Can create permissions' },
      { name: 'read.permissions', description: 'Can read permissions' },
      { name: 'update.permissions', description: 'Can update permissions' },
      { name: 'delete.permissions', description: 'Can delete permissions' },
    ];

    console.log('Seeding permissions...');

    // Using onConflictDoNothing to avoid duplicates if re-running
    await db.insert(permissions).values(perms).onConflictDoNothing().execute();
  }
}
