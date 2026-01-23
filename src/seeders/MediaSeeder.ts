import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Seeder } from './Seeder.ts';
import { mediaSchema } from '../schema/media.ts';
import { userSchema } from '../schema/users.ts';
import { eq } from 'drizzle-orm';

export class MediaSeeder extends Seeder {
  async run(db: NodePgDatabase<Record<string, never>>): Promise<void> {
    console.log('Seeding media...');

    // Get a user to assign media to
    const adminUser = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, 'admin@admin.com'))
      .execute();

    if (adminUser.length === 0) {
      console.warn('Admin user not found. Skipping media seeding.');
      return;
    }

    const userId = adminUser[0].id;

    const mediaData = [
      {
        filename: 'sample-image.jpg',
        mimeType: 'image/jpeg',
        fileUrl: 'https://via.placeholder.com/600x400',
        sizeBytes: 102400,
        uploadedBy: userId,
        altText: 'A sample placeholder image',
        description: 'Just a sample image for seeding purposes.',
      },
    ];

    await db
      .insert(mediaSchema)
      .values(mediaData)
      .onConflictDoNothing()
      .execute();
  }
}
