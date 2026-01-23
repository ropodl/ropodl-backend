import 'dotenv/config';
import { db, pool } from '../db/db.ts';
import { PermissionSeeder } from './PermissionSeeder.ts';
import { RoleSeeder } from './RoleSeeder.ts';
import { UserSeeder } from './UserSeeder.ts';
import { MediaSeeder } from './MediaSeeder.ts';

async function seed() {
  console.log('Starting seeding process...');

  const seeders = [
    new PermissionSeeder(),
    new RoleSeeder(),
    new UserSeeder(),
    new MediaSeeder(),
  ];

  try {
    for (const seeder of seeders) {
      await seeder.run(db);
    }
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

await seed()