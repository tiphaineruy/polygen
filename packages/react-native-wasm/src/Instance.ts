import type { ImportObject } from './WebAssembly';
import NativeWASM, {
  type OpaqueModuleNativeHandle,
  type OpaqueModuleInstanceNativeHandle,
} from './NativeWebAssembly';

export class Instance {
  // @ts-ignore
  #nativeHandle: OpaqueModuleInstanceNativeHandle;
  // @ts-ignore
  #imports: ImportObject;

  constructor(module: OpaqueModuleNativeHandle, imports: ImportObject) {
    this.#imports = imports;
    this.#nativeHandle = NativeWASM.createModuleInstance(module, imports);
  }
}
