import { Module } from './Module';
import { Instance } from './Instance';

/**
 * Type from WebAssembly HTML Spec
 */
type BufferSource = ArrayBuffer | ArrayBufferView;

const MAGIC = ['C'.charCodeAt(0), 'K'.charCodeAt(0)];

/**
 * Type representing object with imports
 */
export type ImportObject = Record<string, any>;

/**
 * Validates the specified WebAssembly binary module.
 *
 * As all WebAssembly modules must be known at compile-time and pre-compiled,
 * instead of passing module contents, we are accepting a module name
 * prefixed with magic number.
 *
 * @param bufferOrView ArrayBuffer or DataView containing the WebAssembly module to validate
 */
export function validate(bufferOrView: BufferSource): boolean {
  const view = ArrayBuffer.isView(bufferOrView)
    ? (bufferOrView as DataView)
    : new DataView(bufferOrView);

  const isCorrect =
    view.getInt8(0) === MAGIC[0] && view.getInt8(1) === MAGIC[1];

  if (!isCorrect) {
    console.warn(
      '[react-native-wasm] Validation of WebAssembly module failed. Only precompiled modules are allowed.'
    );
  }

  return isCorrect;
}

export async function compile(bufferOrView: BufferSource): Promise<Module> {
  return new Module(getModuleName(bufferOrView));
}

export async function instantiate(
  bufferOrView: BufferSource,
  imports?: ImportObject
): Promise<Instance>;
export async function instantiate(
  module: Module,
  imports?: ImportObject
): Promise<Instance>;
export async function instantiate(
  source: Module | BufferSource,
  imports: ImportObject = {}
): Promise<Instance> {
  if (source instanceof Module) {
    return new Instance(source.name, imports);
  } else {
    return new Instance(getModuleName(source), imports);
  }
}

function getModuleName(bufferOrView: BufferSource): string {
  const buffer = ArrayBuffer.isView(bufferOrView)
    ? (bufferOrView as DataView).buffer
    : (bufferOrView as ArrayBuffer);

  const nameBuffer = buffer.slice(2); // Skip the CK magic number
  const decoder = new TextDecoder();
  return decoder.decode(nameBuffer);
}
