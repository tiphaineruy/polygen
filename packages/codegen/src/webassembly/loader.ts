import {
  decode,
  type DecodeResult,
  type ModuleImport,
  type ModuleExport,
} from '@webassemblyjs/wasm-parser';
import type { ModuleExportInfo, ModuleImportInfo } from './types.js';
import { WebAssemblyModule } from './module.js';
import { SymbolSet } from './helpers/symbol-set.js';
import { readFile } from 'node:fs/promises';
import { computeChecksumBuffer } from '../utils/checksum.js';
import { buildLookupCache, LookupCache } from './lookup-cache.js';

/**
 * Creates WebAssemblyModule from specified loaded metadata.
 *
 * @param name Name of the module (usually the filename without the extension)
 * @param checksum Module checksum
 * @param metadata Loaded metadata
 */
export function readWasmModule(
  name: string,
  checksum: Buffer,
  metadata: DecodeResult
): WebAssemblyModule {
  const imports = new SymbolSet<ModuleImportInfo>();
  const exports = new SymbolSet<ModuleExportInfo>();
  const fields = metadata.body[0]?.fields ?? [];
  const lookupCache = buildLookupCache(fields);

  for (const field of fields) {
    switch (field.type) {
      case 'ModuleImport': {
        const result = processImport(field);
        if (result) {
          imports.add(result);
        }
        break;
      }
      case 'ModuleExport': {
        const result = processExport(field, lookupCache);
        if (result) {
          exports.add(result);
        }
        break;
      }
    }
  }

  return new WebAssemblyModule(name, checksum, imports, exports);
}

/**
 * Creates a WebAssembly module from specified path to WASM module.
 *
 * @param wasmPath Path to the WASM module to read
 *
 * @returns Instance of loaded WebAssemblyModule
 */
export async function loadWasmModuleFromFile(
  wasmPath: string
): Promise<WebAssemblyModule> {
  const moduleBinaryContents = await readFile(wasmPath, null);
  const checksum = computeChecksumBuffer(moduleBinaryContents);
  const parsedModule = decode(moduleBinaryContents, {
    ignoreCodeSection: true,
    ignoreDataSection: true,
  });
  return readWasmModule(wasmPath, checksum, parsedModule);
}

function processImport(field: ModuleImport): ModuleImportInfo | undefined {
  if (field.descr.type === 'FuncImportDescr') {
    const sig = field.descr.signature;

    return {
      type: 'Function',
      module: field.module,
      name: field.name,
      params: sig.params.map((e) => e.valtype),
      results: sig.results,
    };
  } else if (field.descr.type === 'GlobalType') {
    return {
      type: 'Global',
      module: field.module,
      name: field.name,
      variableType: field.descr.valtype,
      isMutable: field.descr.mutability === 'var',
    };
  }

  // @ts-ignore
  console.warn('Found unknown import type: ', field.descr.type, field);
  return;
}

function processExport(
  field: ModuleExport,
  lookupCache: LookupCache
): ModuleExportInfo | undefined {
  if (field.descr.exportType === 'Func') {
    const func = lookupCache.getFunction(field.descr.id);

    if (!func) {
      console.warn(`Could not find function named: ${field.name}`);
      return;
    }

    return {
      type: 'Function',
      name: field.name,
      params: func.signature.params.map((e) => e.valtype),
      results: func.signature.results,
    };
  } else if (field.descr.exportType === 'Memory') {
    return {
      type: 'Memory',
      name: field.name,
    };
  } else if (field.descr.exportType === 'Global') {
    const globalVar = lookupCache.getGlobal(field.descr.id);
    if (!globalVar) {
      console.warn(`Could not find global ${field.name}`);
      return;
    }

    return {
      type: 'Global',
      name: field.name,
      variableType: globalVar.globalType.valtype,
      isMutable: globalVar.globalType.mutability === 'var',
    };
  } else if (field.descr.exportType === 'Table') {
    const table = lookupCache.getTable(field.descr.id);
    if (!table) {
      console.warn(`Could not find table ${field.name}`);
      return;
    }

    return {
      type: 'Table',
      name: field.name,
      limits: table.limits,
      elementType: table.elementType,
    };
  }

  console.warn('Found unknown export type: ', field.descr.exportType);
  return;
}
