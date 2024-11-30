import fs from 'node:fs';
import crypto from 'node:crypto';

/**
 * Computes SHA-256 checksum of specified file, and returns the buffer.
 *
 * @param path
 */
export function computeFileChecksumBuffer(path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const rs = fs.createReadStream(path);
    rs.on('error', reject);
    rs.on('data', (chunk) => hash.update(chunk));
    rs.on('end', () => resolve(hash.digest()));
  });
}

/**
 * Computes SHA-256 checksum of specified data, and returns the buffer.
 *
 * @param data
 */
export function computeChecksumBuffer(data: Buffer): Buffer {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest();
}
