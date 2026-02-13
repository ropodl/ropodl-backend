import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Seeder } from './Seeder.ts';
import bcrypt from 'bcrypt';
import { userSchema } from '../schema/users.ts';

export class UserSeeder extends Seeder {
  async run(db: NodePgDatabase<Record<string, never>>): Promise<void> {
    console.log('Seeding users...');

    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const userPassword = await bcrypt.hash('password123', saltRounds);

    const usersData = [
      {
        username: 'admin',
        fullname: 'Admin',
        email: 'admin@admin.com',
        avatar: '',
        password: adminPassword,
      },
      {
        username: 'johndoe',
        fullname: 'John Doe',
        email: 'john@example.com',
        avatar: '',
        password: userPassword,
      },
    ];

    await db
      .insert(userSchema)
      .values(usersData)
      .onConflictDoNothing()
      .execute();
  }
}
