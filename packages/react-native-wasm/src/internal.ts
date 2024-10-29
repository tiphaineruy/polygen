import type { BufferSource } from './common';

/**
 * Special prefix used in ArrayBuffers to differentiate mocked WebAssembly modules
 */
export const MAGIC = ['C'.charCodeAt(0), 'K'.charCodeAt(0)];

/**
 * Gets module name from buffer source (removes Magic numbers).
 * @param bufferOrView
 */
export function getModuleName(bufferOrView: BufferSource): string {
  const buffer = ArrayBuffer.isView(bufferOrView)
    ? (bufferOrView as DataView).buffer
    : (bufferOrView as ArrayBuffer);

  const nameBuffer = buffer.slice(2); // Skip the CK magic number
  const view = new Uint8Array(nameBuffer);
  let str = '';
  view.forEach((byte) => {
    str += String.fromCharCode(byte);
  });
  return str;
}

export function makeModuleName(name: string): ArrayBuffer {
  const view = new Uint8Array(name.length + 2);
  view.set(MAGIC);
  const asciiBytes = Array.prototype.map.call(name, (char) =>
    char.charCodeAt(0)
  ) as number[];
  view.set(asciiBytes, 2);
  return view.buffer;
}
