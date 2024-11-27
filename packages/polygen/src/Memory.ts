import NativeWASM, { type OpaqueMemoryNativeHandle } from './NativeWebAssembly';

/**
 * Object describing memory metadata
 *
 * This object specifies memory details and is used when creating
 * memory object from JavaScript code.
 */
export interface MemoryDescriptor {
  /**
   * Initial number of pages.
   */
  initial: number;

  /**
   * Maximum number of pages for this memory.
   */
  maximum?: number;
}

/**
 * Helper function checking if specified object is a memory descriptor.
 *
 * @param descriptor Object to check
 */
function isMemoryDescriptor(descriptor: any): descriptor is MemoryDescriptor {
  return 'initial' in descriptor;
}

/**
 * @spec https://webassembly.github.io/spec/js-api/index.html#memories
 */
export class Memory {
  readonly #instance: OpaqueMemoryNativeHandle;

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
