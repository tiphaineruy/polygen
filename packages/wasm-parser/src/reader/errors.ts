/**
 * Represents an error that occurs when decoding a WebAssembly module.
 *
 * Extends the base `Error` class to provide additional context specific
 * to WebAssembly decoding errors.
 *
 * @remarks
 * This error is typically used when a WebAssembly binary cannot be
 * successfully decoded due to syntax errors, data corruption, or
 * unsupported features.
 *
 * @param message - A description of the error that occurred.
 */
export class WebAssemblyDecodeError extends Error {
  public readonly binaryByteOffset?: number;

  constructor(message: string, offset?: number) {
    const suffix =
      offset !== undefined ? ` (binary offset: 0x${offset.toString(16)})` : '';
    super(message + suffix);
    this.binaryByteOffset = offset;
  }
}
