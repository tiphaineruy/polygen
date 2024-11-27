import {
  decode,
  type DecodeResult,
  type DescriptorIdentifier,
  type ModuleImport,
  type ModuleExport,
  type ModuleField,
  type ModuleFunctionSignature,
} from '@webassemblyjs/wasm-parser';
import type { ModuleExportInfo, ModuleImportInfo } from './types.js';
import { WebAssemblyModule } from './module.js';
import { SymbolSet } from './helpers/symbol-set.js';
import { readFile } from 'node:fs/promises';

/**
 * Helper type for Function cache map.
 */
type FuncCache = Map<string, ModuleFunctionSignature>;

/**
 * Creates WebAssemblyModule from specified loaded metadata.
 *
 * @param name Name of the module (usually the filename without the extension)
 * @param metadata Loaded metadata
 */
export function createWasmModule(
  name: string,
  metadata: DecodeResult
): WebAssemblyModule {
  const imports = new SymbolSet<ModuleImportInfo>();
  const exports = new SymbolSet<ModuleExportInfo>();
  const fields = metadata.body[0]?.fields ?? [];
  const funcCache = buildFuncCache(fields);

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
        const result = processExport(field, funcCache);
        if (result) {
          exports.add(result);
        }
        break;
      }
    }
  }

  return new WebAssemblyModule(name, imports, exports);
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
  const moduleBinaryContents = await readFile(wasmPath);
  const parsedModule = decode(moduleBinaryContents, {
    ignoreCodeSection: true,
    ignoreDataSection: true,
  });
  return createWasmModule(wasmPath, parsedModule);
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
  }

  console.warn('Found unknown import type: ', field.descr.type, field);
  return;
}

function processExport(
  field: ModuleExport,
  funcCache: FuncCache
): ModuleExportInfo | undefined {
  if (field.descr.exportType === 'Func') {
    const sig = resolveFunctionId(field.descr.id, funcCache);

    if (!sig) {
      console.warn(`Could not find export signature for: ${field.name}`);
      return;
    }

    return {
      name: field.name,
      type: 'Function',
      params: sig.params.map((e) => e.valtype),
      results: sig.results,
    };
  } else if (field.descr.exportType === 'Memory') {
    return {
      name: field.name,
      type: 'Memory',
    };
  }

  console.warn('Found unknown export type: ', field.descr.exportType);
  return;
}

/**
 * Creates a `Map` object with found function types for faster lookup.
 */
function buildFuncCache(fields: ModuleField[]): FuncCache {
  const map = new Map<string, ModuleFunctionSignature>();

  // Build map of funcs
  for (const field of fields) {
    if (field.type === 'Func') {
      map.set(field.name.value, field.signature);
    }
  }

  return map;
}

function resolveFunctionId(
  identifier: DescriptorIdentifier,
  funcCache: FuncCache
): ModuleFunctionSignature | undefined {
  switch (identifier.type) {
    case 'Identifier':
      return funcCache.get(identifier.value);
    case 'NumberLiteral':
      return funcCache.get(`func_${identifier.raw}`);
  }
}
