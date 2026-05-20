import sharp from 'sharp';
import { processCarImage } from '@/lib/carImages';
import { MAX_IMAGE_BYTES } from '@/lib/carImageConstraints';

describe('processCarImage', () => {
  test('rejects small images', async () => {
    const buf = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    await expect(processCarImage(buf, 'image/jpeg')).rejects.toThrow('Image resolution too small');
  });

  test('rejects unsupported types', async () => {
    const buf = await sharp({
      create: {
        width: 1200,
        height: 900,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .png()
      .toBuffer();

    await expect(processCarImage(buf, 'image/gif')).rejects.toThrow('Unsupported image type');
  });

  test('rejects images over max bytes', async () => {
    const buf = Buffer.alloc(MAX_IMAGE_BYTES + 1, 0);
    await expect(processCarImage(buf, 'image/jpeg')).rejects.toThrow('Image too large');
  });

  test('creates thumb and medium variants', async () => {
    const buf = await sharp({
      create: {
        width: 1200,
        height: 900,
        channels: 3,
        background: { r: 10, g: 10, b: 10 },
      },
    })
      .jpeg()
      .toBuffer();

    const out = await processCarImage(buf, 'image/jpeg');
    expect(out.original.width).toBe(1200);
    expect(out.original.height).toBe(900);
    expect(out.thumb.contentType).toBe('image/webp');
    expect(out.thumb.bytes).toBeGreaterThan(0);
    expect(out.medium.contentType).toBe('image/webp');
    expect(out.medium.bytes).toBeGreaterThan(0);
  });
});

