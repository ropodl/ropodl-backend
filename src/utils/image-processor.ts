import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export interface ImageVariants {
  full: string;
  card: string;
  blur: string;
}

export const processImage = async (
  inputPath: string,
  outputDir: string,
  baseFileName: string
): Promise<ImageVariants> => {
  const fileNameWithoutExt = baseFileName.includes('.')
    ? baseFileName.substring(0, baseFileName.lastIndexOf('.'))
    : baseFileName;

  const variants = {
    full: `${fileNameWithoutExt}_full.webp`,
    card: `${fileNameWithoutExt}_card.webp`,
    blur: `${fileNameWithoutExt}_blur.webp`,
  };

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const image = sharp(inputPath);

  // Auto-rotation based on EXIF data
  const pipeline = image.rotate();

  await Promise.all([
    // Full version: Max height 1200px, fit: 'inside', WebP (75%)
    pipeline
      .clone()
      .resize({ height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(join(outputDir, variants.full)),

    // Card version: Fixed height 220px, fit: 'contain', WebP (65%)
    pipeline
      .clone()
      .resize({ height: 220, fit: 'contain' })
      .webp({ quality: 65 })
      .toFile(join(outputDir, variants.card)),

    // Blur version: Small dimension, blur, WebP (25%)
    pipeline
      .clone()
      .resize({ width: 20 })
      .blur(5)
      .webp({ quality: 25 })
      .toFile(join(outputDir, variants.blur)),
  ]);

  return variants;
};
