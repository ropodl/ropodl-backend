import { Hono } from 'hono';
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { cwd } from "node:process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import sharp from 'sharp';

import { db } from "../../db/db.js";
import { mediaSchema } from "../../schema/media.js";
import { isAdmin, hasPermission, authenticate } from '../../middleware/admin.js';
import { eq, like, or, desc } from 'drizzle-orm';
import { processImage } from '../../utils/image-processor.js';
import { error } from "../../utils/error.js";

const app = new Hono<{
  Variables: {
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
    }
  }
}>();

app.get('/', isAdmin, async (c) => {
  const search = c.req.query('search');

  let query = await db.select().from(mediaSchema).orderBy(desc(mediaSchema.createdAt));

  if (search) {
    // @ts-ignore - drizzle types can be tricky with like and nulls but it works
    query = query.where(
      or(
        like(mediaSchema.filename, `%${search}%`),
        like(mediaSchema.altText, `%${search}%`),
        like(mediaSchema.description, `%${search}%`)
      )
    );
  }

  const allMedia = await query;
  return c.json(allMedia);
});

app.get('/:id', isAdmin, async (c) => {
  const id = c.req.param('id')
  const media = await db.select().from(mediaSchema).where(eq(mediaSchema.id, Number(id))).limit(1);

  if (!media.length) return error(c, 'Media not found', 404);

  return c.json(media[0]);
});

app.patch('/:id', authenticate, hasPermission('media.edit'), async (c) => {
  const id = Number(c.req.param('id'));
  const { altText, description } = await c.req.json();

  const [updated] = await db.update(mediaSchema)
    .set({ altText, description })
    .where(eq(mediaSchema.id, id))
    .returning();

  if (!updated) return error(c, 'Media not found', 404);

  return c.json(updated);
});

app.delete('/:id', authenticate, hasPermission('media.delete'), async (c) => {
  const id = Number(c.req.param('id'));

  const [media] = await db.select().from(mediaSchema).where(eq(mediaSchema.id, id)).limit(1);
  if (!media) return error(c, 'Media not found', 404);

  // Delete physical files
  const relativePath = media.fileUrl.split('/').slice(-4).join('/'); // media/YYYY/MM/DD/filename
  const fullPath = join(cwd(), relativePath);

  try {
    if (existsSync(fullPath)) await unlink(fullPath);

    // Delete variants if they exist
    if (media.metadata?.variants) {
      const baseDir = dirname(fullPath);
      for (const variant of Object.values(media.metadata.variants)) {
        const variantPath = join(baseDir, variant);
        if (existsSync(variantPath)) await unlink(variantPath);
      }
    }
  } catch (err) {
    console.error('Failed to delete physical files:', err);
  }

  await db.delete(mediaSchema).where(eq(mediaSchema.id, id));

  return c.json({ message: 'Media deleted successfully' });
});

app.post('/create', authenticate, hasPermission('media.create'), async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  const user = c.get('user');

  if (file && typeof file === 'object' && 'arrayBuffer' in file) {
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return c.json({ error: 'File type not allowed' }, 400);
    }

    const fileContent = await file.arrayBuffer();
    const buffer = Buffer.from(fileContent);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const relativeDir = join('media', String(year), month, day);
    const uploadDir = join(cwd(), relativeDir);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const fileExtension = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
    const fileName = `${randomUUID()}${fileExtension.replace(/\s+/g, '')}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    let metadata = {};
    if (file.type.startsWith('image/')) {
      try {
        const variants = await processImage(filePath, uploadDir, fileName);
        const imageInfo = await sharp(buffer).metadata();
        metadata = {
          dimensions: { width: imageInfo.width, height: imageInfo.height },
          variants
        };
      } catch (err) {
        console.error('Image processing failed:', err);
      }
    }

    const url = new URL(c.req.url);
    const baseUrl = process.env.NODE_ENV === 'production' && process.env.APP_URL
      ? process.env.APP_URL
      : url.origin;

    const [newMedia] = await db.insert(mediaSchema).values({
      filename: fileName,
      mimeType: file?.type,
      fileUrl: `${baseUrl}/${relativeDir}/${fileName}`,
      sizeBytes: buffer.byteLength,
      uploadedBy: user?.id,
      altText: file.name,
      metadata
    }).returning();

    return c.json(newMedia);
  }

  return c.json({ error: 'No file uploaded' }, 400);
});

export default app;
