import type { ImportObject } from './WebAssembly';
import type { OpaqueNativeInstanceHandle } from './NativeWebAssembly';
import NativeWASM from './NativeWebAssembly';

export class Instance {
  // @ts-ignore
  #nativeHandle: OpaqueNativeInstanceHandle;
  // @ts-ignore
  #imports: ImportObject;

  constructor(name: string, imports: ImportObject) {
    this.#imports = imports;
    this.#nativeHandle = NativeWASM.instantiateModule(name, imports);
  }
}
