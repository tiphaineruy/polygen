import { readFile } from 'node:fs/promises';
import {
  decode,
  type ModuleField,
  type ModuleFunctionSignature,
  type DecodeResult,
  type TypeName,
} from '@webassemblyjs/wasm-parser';

export interface ModuleImportFuncInfo {
  type: 'func';
  module: string;
  name: string;
  params: TypeName[];
  results: TypeName[];
}

export interface ModuleExportFuncInfo {
  type: 'func';
  name: string;
  params: TypeName[];
  results: TypeName[];
}

export interface ModuleExportMemInfo {
  type: 'mem';
  name: string;
}

export type ModuleImportInfo = ModuleImportFuncInfo;
export type ModuleExportInfo = ModuleExportFuncInfo | ModuleExportMemInfo;

/**
 * Class representing parsed WebAssembly module metadata.
 *
 * The metadata is WebAssembly only, and is not related to `wasm2c` or any other
 * utility or runtime.
 */
export class WasmModule {
  /**
   * Path to the file that the metadata was loaded from.
   */
  public readonly sourceModulePath: string;

  /**
   * All WASM Module fields.
   */
  public readonly fields: ModuleField[];

  public readonly imports: Map<string, Set<ModuleImportInfo>>;

  private readonly _funcs: Map<string, ModuleFunctionSignature>;

  constructor(path: string, metadata: DecodeResult) {
    this.sourceModulePath = path;
    this.fields = metadata.body[0]?.fields ?? [];
    this._funcs = this._cacheFuncs();
    this.imports = this._cacheImports();
  }

  /**
   * Reads metadata information from specified `wasm` file.
   *
   * @param wasmPath Path to the WASM module to read
   * @returns Object containing WebAssembly module metadata
   */
  static async fromWASM(wasmPath: string): Promise<WasmModule> {
    const moduleBinaryContents = await readFile(wasmPath);
    const parsedModule = decode(moduleBinaryContents, {
      ignoreCodeSection: true,
      ignoreDataSection: true,
    });
    return new WasmModule(wasmPath, parsedModule);
  }

  /**
   * Returns a generators that iterates over this module imports.
   *
   * @see getImportedFunctions
   */
  public *getImports(): Generator<ModuleImportInfo> {
    for (const field of this.fields) {
      if (field.type !== 'ModuleImport') {
        continue;
      }

      if (field.descr.type === 'FuncImportDescr') {
        const sig = field.descr.signature;

        if (!sig) {
          console.warn(`Could not find import signature for: ${field.name}`);
          continue;
        }

        yield {
          type: 'func',
          module: field.module,
          name: field.name,
          params: sig.params.map((e) => e.valtype),
          results: sig.results,
        };
      } else {
        console.warn('Found unknown import type: ', field.descr.type, field);
      }
    }
  }

  public *getImportedFunctions(): Generator<ModuleImportInfo> {
    for (const importInfo of this.getImports()) {
      if (importInfo.type === 'func') {
        yield importInfo;
      }
    }
  }

  /**
   * Returns a generators that iterates over this module exports.
   *
   * To narrow-down the exported types, use dedicated methods, such as
   * `getExportedFunctions` which only yields exported functions.
   *
   * @see getExportedFunctions
   */
  public *getExports(): Generator<ModuleExportInfo> {
    for (const field of this.fields) {
      if (field.type !== 'ModuleExport') {
        continue;
      }

      if (field.descr.exportType === 'Func') {
        const sig = this._funcs.get(`func_${field.descr.id.raw}`);

        if (!sig) {
          console.warn(`Could not find export signature for: ${field.name}`);
          continue;
        }

        yield {
          name: field.name,
          type: 'func',
          params: sig.params.map((e) => e.valtype),
          results: sig.results,
        };
      } else if (field.descr.exportType === 'Memory') {
        yield {
          name: field.name,
          type: 'mem',
        };
      } else {
        console.warn('Found unknown export type: ', field.descr.exportType);
      }
    }
  }

  /**
   * Returns a generators that iterates over this exported functions.
   *
   * @see getExports
   */
  public *getExportedFunctions(): Generator<ModuleExportFuncInfo> {
    for (const exportInfo of this.getExports()) {
      if (exportInfo.type === 'func') {
        yield exportInfo;
      }
    }
  }

  /**
   * Returns a generators that iterates over this exported memories.
   *
   * @see getExports
   */
  public *getExportedMemories(): Generator<ModuleExportMemInfo> {
    for (const exportInfo of this.getExports()) {
      if (exportInfo.type === 'mem') {
        yield exportInfo;
      }
    }
  }

  /**
   * Creates a `Map` object with found function types for faster lookup.
   *
   * @private
   */
  private _cacheFuncs(): Map<string, ModuleFunctionSignature> {
    const map = new Map<string, ModuleFunctionSignature>();

    // Build map of funcs
    for (const field of this.fields) {
      if (field.type === 'Func') {
        map.set(field.name.value, field.signature);
      }
    }

    return map;
  }

  /**
   * Creates a `Map` object with found import modules for faster lookup.
   *
   * @private
   */
  private _cacheImports(): Map<string, Set<ModuleImportInfo>> {
    const map = new Map<string, Set<ModuleImportInfo>>();

    for (const importInfo of this.getImports()) {
      let importedModule = map.get(importInfo.module);

      if (!importedModule) {
        importedModule = new Set();
        map.set(importInfo.module, importedModule);
      }

      importedModule.add(importInfo);
    }

    return map;
  }
}
