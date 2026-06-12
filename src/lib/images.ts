export async function compressImage(
  blob: Blob,
  maxWidth = 1280,
  quality = 0.75
): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') return blob;

  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return blob;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error('Compression failed')),
      'image/jpeg',
      quality
    );
  });
}

export function formatGradingError(payload: {
  error?: string;
  detail?: string;
}): string {
  const base = payload.error || 'Grading failed';
  if (!payload.detail) return base;
  const detail =
    typeof payload.detail === 'string'
      ? payload.detail
      : JSON.stringify(payload.detail);
  return `${base}: ${detail.slice(0, 400)}`;
}
