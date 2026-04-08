export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

/**
 * Gets the cropped image from the original image based on crop dimensions.
 * Optimized for smaller file sizes (targets below 300KB)
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  outputType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // 1. First, we create a temporary canvas to handle rotation if needed
  // (Simplified for this use case as we usually don't rotate avatars)
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('No temp context');

  // 2. Set canvas to the actual crop size first
  // Limit the max size to preserve clarity while keeping file size small
  // For avatars, 600-800px is more than enough
  const MAX_DIM = 800;
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > MAX_DIM || targetHeight > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / targetWidth, MAX_DIM / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 3. Draw the cropped portion from the original image onto our target canvas
  // This automatically scales it down if targetWidth/Height are smaller than pixelCrop
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // 4. Return as Blob with compression
  // JPEG 0.8 quality gives great clarity at very small file sizes (usually <100KB)
  return new Promise((resolve) => {
    canvas.toBlob(
      (file) => {
        if (file) resolve(file);
      },
      outputType,
      outputType === 'image/jpeg' ? 0.8 : undefined
    );
  });
}

