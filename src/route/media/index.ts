import { Hono } from 'hono';
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { randomUUID } from "node:crypto";

import { db } from "../../db/db.js";
import { mediaSchema } from "../../schema/media.js";

const app = new Hono();

app.get('/', async (c) => {
  const allMedia = await db.select().from(mediaSchema);
  return c.json(allMedia);
});

const fileUrl = () => {
  // if(process.env)
  console.log(process.env)
  console.log(import.meta)
  return process.env.APP_URL;
}

app.post('/create', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (file && typeof file === 'object' && 'arrayBuffer' in file) {
    const fileContent = await file.arrayBuffer();
    const buffer = Buffer.from(fileContent);

    const fileName = `${randomUUID()}-${file.name}`;
    const uploadDir = join(cwd(), 'media');
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const [newMedia] = await db.insert(mediaSchema).values({
      filename: fileName,
      mimeType: file?.type,
      // fileUrl: `${process.env.APP_URL}/media/${fileName}`, // Assuming served statically
      fileUrl: <string>fileUrl(),
      sizeBytes: buffer.byteLength,
      uploadedBy: 'admin', // TODO: Get from auth context
      altText: file.name,
    }).returning();

    return c.json(newMedia);
  }

  return c.json({ error: 'No file uploaded' }, 400);
});

export default app;
