import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Seeder } from './Seeder.ts';
import { userSchema, roles } from '../schema/users.ts';
import * as bcrypt from 'bcrypt';

export class UserSeeder extends Seeder {
  async run(db: NodePgDatabase<Record<string, never>>): Promise<void> {
    console.log('Seeding users...');

    // Fetch roles
    const superAdminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'admin'))
      .execute();
    const userRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'user'))
      .execute();

    if (superAdminRole.length === 0) {
      console.warn(
        'Super Admin role not found. Skipping default admin creation.'
      );
      return;
    }

    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const userPassword = await bcrypt.hash('password123', saltRounds);

    const usersData = [
      {
        username: 'admin',
        fullname: 'Admin',
        email: 'admin@admin.com',
        password: adminPassword,
        roleId: superAdminRole[0].id,
      },
      {
        username: 'johndoe',
        fullname: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        roleId: userRole.length > 0 ? userRole[0].id : null,
      },
    ];

    await db
      .insert(userSchema)
      .values(usersData)
      .onConflictDoNothing()
      .execute();
  }
}
