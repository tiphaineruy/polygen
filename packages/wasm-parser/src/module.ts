import type {
  ModuleExport,
  ModuleFunction,
  ModuleGlobal,
  ModuleImport,
  ModuleMemory,
  ModuleTable,
} from './types.js';

/**
 * Class representing a WebAssembly Module.
 */
export class WebAssemblyModule {
  /**
   * An array of module functions.
   */
  public functions: ModuleFunction[] = [];

  /**
   * An array of global variables in the module.
   */
  public globals: ModuleGlobal[] = [];

  /**
   * An array of tables in the module.
   */
  public tables: ModuleTable[] = [];

  /**
   * An array of memory blocks in the module.
   */
  public memories: ModuleMemory[] = [];

  /**
   * An array of module imports.
   */
  public imports: ModuleImport[] = [];

  /**
   * An array of module exports.
   */
  public exports: ModuleExport[] = [];
}
