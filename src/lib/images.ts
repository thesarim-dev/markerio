export async function compressImage(
  blob: Blob,
  maxWidth = 1024,
  quality = 0.7
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
  const detail =
    typeof payload.detail === 'string'
      ? payload.detail
      : payload.detail
        ? JSON.stringify(payload.detail)
        : '';

  if (/quota|rate.limit|billing|exceeded your current quota/i.test(detail)) {
    return (
      'Gemini API quota exceeded. In Supabase secrets, remove GEMINI_MODEL or set it to gemini-2.5-flash. ' +
      'Enable billing at aistudio.google.com if needed. Using gemini-1.5-pro often has zero free quota.'
    );
  }

  if (!detail) return base;
  return `${base}: ${detail.slice(0, 400)}`;
}

export const MAX_PAGES_PER_GRADE = 4;
