/**
 * Client-side image optimization utilities
 * Resize and compress images before upload to reduce file size and improve upload speed
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 - 1.0
  format?: 'jpeg' | 'webp';
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'jpeg',
};

/**
 * Resize and compress image file
 * Returns optimized File object
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          const maxWidth = opts.maxWidth;
          const maxHeight = opts.maxHeight;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Cannot get canvas context'));
            return;
          }

          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              // Create new File with optimized data
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, `.${opts.format}`),
                {
                  type: `image/${opts.format}`,
                  lastModified: Date.now(),
                }
              );

              resolve(optimizedFile);
            },
            `image/${opts.format}`,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Optimize multiple images in parallel
 */
export async function optimizeImages(
  files: File[],
  options?: ImageOptimizationOptions
): Promise<File[]> {
  const optimizedFiles = await Promise.all(
    files.map((file) => optimizeImage(file, options))
  );
  return optimizedFiles;
}

