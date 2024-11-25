import { SymbolSet } from './helpers/symbol-set.js';
import type {
  ModuleExportFuncInfo,
  ModuleExportInfo,
  ModuleExportMemInfo,
  ModuleImportFuncInfo,
  ModuleImportInfo,
} from './types.js';

/**
 * Class representing parsed WebAssembly module metadata.
 *
 * The metadata is WebAssembly only, and is not related to `wasm2c` or any other
 * utility or runtime.
 */
export class WebAssemblyModule {
  /**
   * Path to the file that the metadata was loaded from.
   */
  public readonly sourceModulePath: string;

  /**
   * A smart set of imported symbols by this module.
   *
   * This is a normal `Set` with additional lookup caches
   * by symbol name and by symbol type.
   *
   * @see SymbolSet
   */
  public readonly imports: SymbolSet<ModuleImportInfo>;

  /**
   * A smart set of exported symbols by this module.
   *
   * This is a normal `Set` with additional lookup caches
   * by symbol name and by symbol type.
   *
   * @see SymbolSet
   */
  public readonly exports: SymbolSet<ModuleExportInfo>;

  constructor(
    path: string,
    imports: SymbolSet<ModuleImportInfo>,
    exports: SymbolSet<ModuleExportInfo>
  ) {
    this.sourceModulePath = path;
    this.imports = imports;
    this.exports = exports;
  }

  /**
   * Returns a `Set` of this module imported functions.
   */
  public get importedFunctions(): Set<ModuleImportFuncInfo> {
    return this.imports.getByType('Function');
  }

  /**
   * Returns a `Set` of this module exported functions.
   */
  public get exportedFunctions(): Set<ModuleExportFuncInfo> {
    return this.exports.getByType('Function');
  }

  /**
   * Returns a `Set` of this module exported memories.
   */
  public get exportedMemories(): Set<ModuleExportMemInfo> {
    return this.exports.getByType('Memory');
  }
}
