// Storage Service — handles file uploads (e.g., student PDF submissions, handwritten work)
// Future integration: Supabase Storage, Cloudinary, AWS S3, etc.

/**
 * uploadFile — Uploads a file to storage and returns the public URL.
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Target file name
 * @param {string} bucket - Storage bucket name
 * @returns {{ url: string }}
 */
export const uploadFile = async (fileBuffer, fileName, bucket) => {
  // TODO: Integrate with Supabase Storage or cloud provider
  throw new Error('Storage service not yet implemented');
};
