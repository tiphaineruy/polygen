import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

export type NativeImportObject = UnsafeObject;
export type UnsafeArrayBuffer = UnsafeObject;

/**
 * WebAssembly type
 */
export enum NativeType {
  I32 = 0,
  U32 = 1,
  I64 = 2,
  U64 = 3,
  F32 = 4,
  F64 = 5,
}

/**
 * @spec https://webassembly.github.io/spec/js-api/index.html#modules
 */
export type ImportExportKind = 'function' | 'table' | 'memory' | 'global';

/**
 * Describes a single export from a module.
 *
 * Returned from the call to `WebAssembly.Module.exports()`.
 *
 * @spec https://webassembly.github.io/spec/js-api/index.html#modules
 */
export interface ModuleExportDescriptor {
  /**
   * Name of the exported symbol.
   */
  readonly name: string;

  /**
   * Exported symbol kind.
   */
  readonly kind: ImportExportKind;
}

/**
 * Describes a single import from a module.
 *
 * Returned from the call to `WebAssembly.Module.imports()`.
 *
 * @spec https://webassembly.github.io/spec/js-api/index.html#modules
 */
export interface ModuleImportDescriptor {
  /**
   * Name of the module to import from.
   */
  readonly module: string;

  /**
   * Name of the imported symbol.
   */
  readonly name: string;

  /**
   * Imported symbol kind.
   */
  readonly kind: ImportExportKind;
}

/**
 * Representation of internal precomputed module metadata.
 */
export interface InternalModuleMetadata {
  /**
   * All module imports.
   */
  readonly imports: ModuleImportDescriptor[];

  /**
   * All module exports.
   */
  readonly exports: ModuleExportDescriptor[];
}

/**
 * Opaque handle representing WebAssembly Module.
 */
export type OpaqueModuleNativeHandle = UnsafeObject;

/**
 * Opaque handle representing WebAssembly Module instance.
 */
export type OpaqueModuleInstanceNativeHandle = UnsafeObject;

/**
 * Opaque handle representing WebAssembly memory instance.
 */
export type OpaqueMemoryNativeHandle = UnsafeObject;

/**
 * Opaque handle representing WebAssembly global instance.
 */
export type OpaqueGlobalNativeHandle = UnsafeObject;

export interface Spec extends TurboModule {
  // Modules
  loadModule(moduleData: UnsafeArrayBuffer): OpaqueModuleNativeHandle;
  unloadModule(module: OpaqueModuleNativeHandle): void;
  getModuleMetadata(module: OpaqueModuleNativeHandle): InternalModuleMetadata;

  // Module instances
  createModuleInstance(
    mod: OpaqueModuleNativeHandle,
    importObject: NativeImportObject
  ): OpaqueModuleInstanceNativeHandle;
  destroyModuleInstance(instance: OpaqueModuleInstanceNativeHandle): void;

  // Memory
  createMemory(initial: number, maximum?: number): OpaqueMemoryNativeHandle;
  getMemoryBuffer(instance: OpaqueMemoryNativeHandle): UnsafeArrayBuffer;
  growMemory(instance: OpaqueMemoryNativeHandle, delta: number): void;

  // Globals
  createGlobal(
    type: NativeType,
    isMutable: boolean,
    initialValue: number
  ): OpaqueGlobalNativeHandle;
  getGlobalValue(instance: OpaqueGlobalNativeHandle): number;
  setGlobalValue(instance: OpaqueGlobalNativeHandle, newValue: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('WebAssembly');
