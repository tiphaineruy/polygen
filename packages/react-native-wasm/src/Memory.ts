import NativeWASM, { type OpaqueMemoryNativeHandle } from './NativeWebAssembly';

export interface MemoryDescriptor {
  initial: number;
  maximum?: number;
}

function isMemoryDescriptor(descriptor: any): descriptor is MemoryDescriptor {
  return 'initial' in descriptor;
}

/**
 * @spec https://webassembly.github.io/spec/js-api/index.html#memories
 */
export class Memory {
  #instance: OpaqueMemoryNativeHandle;

  constructor(instance: OpaqueMemoryNativeHandle | MemoryDescriptor) {
    if (isMemoryDescriptor(instance)) {
      this.#instance = NativeWASM.createMemory(
        instance.initial,
        instance.maximum
      );
    } else {
      this.#instance = instance;
    }
  }

  get buffer() {
    return NativeWASM.getMemoryBuffer(this.#instance);
  }

  public grow(delta: number) {
    NativeWASM.growMemory(this.#instance, delta);
  }
}
