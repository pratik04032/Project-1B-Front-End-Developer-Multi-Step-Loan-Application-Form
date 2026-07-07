/**
 * Compresses an image file client-side using the HTML5 Canvas API.
 * Follows the Section C4 specifications:
 * - Target width: max 1200px, maintaining aspect ratio.
 * - Initial quality parameter: 0.7.
 * - Recursively reduces quality by 0.1 down to 0.3 if the blob size is still > 2MB.
 * - Only applies to JPG/PNG images.
 */
export async function compressImage(file: File): Promise<{
  blob: Blob;
  originalSize: number;
  compressedSize: number;
}> {
  return new Promise((resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      return reject(new Error("File is not a supported image type (JPEG/PNG only)"));
    }

    const originalSize = file.size;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Clean up the object URL
      URL.revokeObjectURL(objectUrl);

      // Create canvas with max width of 1200px maintaining aspect ratio
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      const MAX_WIDTH = 1200;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Failed to get 2D context for image compression"));
      }

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Compression loop with recursive quality reduction
      let quality = 0.7;

      const exportBlob = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Failed to export compressed image blob"));
            }

            // If still > 2MB and quality is above 0.3, recursively compress with lower quality
            const TWO_MB = 2 * 1024 * 1024;
            if (blob.size > TWO_MB && quality > 0.3) {
              quality = parseFloat((quality - 0.1).toFixed(1));
              exportBlob();
            } else {
              resolve({
                blob,
                originalSize,
                compressedSize: blob.size
              });
            }
          },
          "image/jpeg",
          quality
        );
      };

      exportBlob();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image file into browser canvas"));
    };

    img.src = objectUrl;
  });
}

/**
 * Converts a Blob or File object to a Base64 string.
 */
export function fileToBase64(fileOrBlob: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(fileOrBlob);
  });
}
