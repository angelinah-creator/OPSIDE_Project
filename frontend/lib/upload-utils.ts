const DEFAULT_MAX_UPLOAD_BYTES = 900 * 1024;
const DEFAULT_MAX_DIMENSION = 1400;

type OptimizeOptions = {
  maxBytes?: number;
  maxDimension?: number;
};

const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52, 0.42];

function makeJpegFileName(originalName: string): string {
  const dot = originalName.lastIndexOf('.');
  if (dot === -1) return `${originalName}.jpg`;
  return `${originalName.slice(0, dot)}.jpg`;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to decode image file'));
    };

    img.src = objectUrl;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to encode optimized image'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}

export async function optimizeImageForUpload(file: File, options: OptimizeOptions = {}): Promise<File> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;

  if (!file.type.startsWith('image/')) return file;
  if (file.size <= maxBytes) return file;
  if (typeof window === 'undefined') return file;

  // Keep vector/animated files untouched; they are not safely transcodable via canvas.
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  const image = await loadImageFromFile(file);

  const initialScale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return file;

  let bestBlob: Blob | null = null;

  for (let resizeAttempt = 0; resizeAttempt < 4; resizeAttempt += 1) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    for (const quality of QUALITY_STEPS) {
      const jpegBlob = await canvasToJpegBlob(canvas, quality);

      if (!bestBlob || jpegBlob.size < bestBlob.size) {
        bestBlob = jpegBlob;
      }

      if (jpegBlob.size <= maxBytes) {
        return new File([jpegBlob], makeJpegFileName(file.name), {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
      }
    }

    width = Math.max(320, Math.round(width * 0.8));
    height = Math.max(320, Math.round(height * 0.8));
  }

  if (!bestBlob || bestBlob.size >= file.size) return file;

  return new File([bestBlob], makeJpegFileName(file.name), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export const uploadLimits = {
  defaultMaxBytes: DEFAULT_MAX_UPLOAD_BYTES,
};
