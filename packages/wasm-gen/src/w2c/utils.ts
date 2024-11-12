/**
 * Encodes a single unsafe character.
 *
 * Encoding is a done by returning a codepoint value in base16,
 * prefixed with `0x`.
 *
 * For example, a space character ' ', will be replaced with `0x20`.
 *
 * This function encodes all characters, even safe ones.
 * It is up to the caller to encode only unsafe characters.
 *
 * @param c character to encode
 * @returns Encoded character
 */
export function escapeUnsafeChar(c: string) {
  return '0x' + (c.codePointAt(0) ?? 0).toString(16).toUpperCase();
}

/**
 * Encodes WebAssembly module name.
 *
 * This function encodes WebAssembly module name according to `w2c` logic.
 *
 * The process covers:
 *  - replacing single underscore characters with double ones,
 *  - replacing any unsafe characters with encoded ones.
 *
 * @see escapeUnsafeChar
 *
 * @param name Name of the module to escape
 * @returns Encoded module name
 */
export function escapeModuleName(name: string): string {
  name = name.replace(/_/g, '__');
  name = name.replace(/[^[a-zA-Z0-9_]/, escapeUnsafeChar);
  return name;
}

/**
 * Encodes WebAssembly symbol name.
 *
 * This function encodes WebAssembly symbol name according to `w2c` logic.
 *
 * The process covers:
 *  - if the name starts with underscore, it is escaped (probably due to C symbol mangling)
 *
 * @see escapeUnsafeChar
 *
 * @param name Name of the symbol to escape
 * @returns Escaped symbol name
 */
export function escapeExportName(name: string): string {
  name = name.replace(/^_(?=_)/, escapeUnsafeChar);
  return name;
}
