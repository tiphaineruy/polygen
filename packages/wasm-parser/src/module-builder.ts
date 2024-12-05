import { readModuleRaw } from './reader/module-reader.js';
import { WebAssemblyModule } from './module.js';
import type { Descriptor, Section } from './reader/types.js';
import type { ModuleSymbol } from './types.js';
import { WebAssemblyDecodeError } from './reader/errors.js';

/**
 * Loads a WebAssembly module from the provided binary data.
 *
 * @param data The binary data of the WebAssembly module represented as an ArrayBuffer.
 * @return A WebAssemblyModule instance constructed from the binary data.
 */
export function loadModule(data: ArrayBuffer): WebAssemblyModule {
  const sections = Object.groupBy(
    readModuleRaw(data),
    (section) => section.type
  );

  const module = new WebAssemblyModule();
  buildFunctions(module, sections.type?.[0]);
  buildGlobals(module, sections.global?.[0]);
  buildMemories(module, sections.memory?.[0]);
  buildTables(module, sections.table?.[0]);

  buildImports(module, sections.import?.[0]);
  buildExports(module, sections.export?.[0]);
  return module;
}

/**
 * Builds the function definitions for a WebAssembly module.
 *
 * @param module - The WebAssembly module to which the function definitions will be added.
 * @param funcSection - An optional section containing function type information, which is expected to be of type 'type'.
 *                      If provided and valid, the module's functions are populated with the function types specified in the section.
 *                      If the section is not provided or invalid, the module's functions remain unchanged.
 * @returns This function does not return a value. It modifies the module's functions in place.
 */
function buildFunctions(module: WebAssemblyModule, funcSection?: Section) {
  if (funcSection?.type !== 'type') {
    return;
  }

  module.functions = funcSection.types.map((funcType) => ({
    kind: 'function',
    parametersTypes: funcType.parameterTypes,
    resultTypes: funcType.returnTypes,
  }));
}

/**
 * Builds the global variable definitions for a WebAssembly module.
 *
 * @param module - The WebAssembly module to which global variables will be added.
 * @param globalSection - An optional section containing global variable information, expected to have the type 'global'.
 *                        If provided and valid, the module's globals are populated with the global variables specified in the section.
 *                        If the section is not provided or invalid, the module's globals remain unchanged.
 * @returns This function does not return a value. It modifies the module's globals in place.
 */
function buildGlobals(module: WebAssemblyModule, globalSection?: Section) {
  if (globalSection?.type !== 'global') {
    return;
  }

  module.globals = globalSection.globals.map((global) => ({
    kind: 'global',
    type: global.type.valueType,
  }));
}

/**
 * Builds the memory definitions for a WebAssembly module.
 *
 * @param module - The WebAssembly module to which memory definitions will be added.
 * @param memorySection - An optional section containing memory information, expected to have the type 'memory'.
 *                        If provided and valid, the module's memories are populated with the memory definitions specified in the section.
 *                        If the section is not provided or invalid, the module's memories remain unchanged.
 * @returns This function does not return a value. It modifies the module's memories in place.
 */
function buildMemories(module: WebAssemblyModule, memorySection?: Section) {
  if (memorySection?.type !== 'memory') {
    return;
  }

  module.memories = memorySection.memories.map((memory) => ({
    kind: 'memory',
    minSize: memory.min,
    maxSize: memory.max,
  }));
}

/**
 * Builds the table definitions for a WebAssembly module.
 *
 * @param module - The WebAssembly module to which table definitions will be added.
 * @param tableSection - An optional section containing table information, expected to have the type 'table'.
 *                       If provided and valid, the module's tables are populated with the table definitions specified in the section.
 *                       If the section is not provided or invalid, the module's tables remain unchanged.
 * @returns This function does not return a value. It modifies the module's tables in place.
 */
function buildTables(module: WebAssemblyModule, tableSection?: Section) {
  if (tableSection?.type !== 'table') {
    return;
  }

  module.tables = tableSection.tables.map((table) => ({
    kind: 'table',
    minSize: table.limits.min,
    maxSize: table.limits.max,
    elementType: table.elementType,
  }));
}

/**
 * Resolves a descriptor into a corresponding module symbol.
 *
 * @param module - The WebAssembly module containing the symbols.
 * @param descriptor - The descriptor that needs to be resolved into a module symbol.
 *                      It specifies the type and index of the symbol within the module.
 * @returns The module symbol corresponding to the descriptor, or `undefined` if the descriptor
 *          cannot be resolved. The symbol can be a function, global, memory, or table, depending
 *          on the descriptor's type.
 */
function resolveDescriptor(
  module: WebAssemblyModule,
  descriptor: Descriptor
): ModuleSymbol | undefined {
  switch (descriptor.type) {
    case 'function':
      return module.functions[descriptor.index];
    case 'global':
      return module.globals[descriptor.index];
    case 'memory':
      return module.memories[descriptor.index];
    case 'table':
      return module.tables[descriptor.index];
  }
}

/**
 * Builds the import definitions for a WebAssembly module.
 *
 * @param module - The WebAssembly module to which import definitions will be added.
 * @param importSection - An optional section containing import information, expected to have the type 'import'.
 *                        If provided and valid, the module's imports are populated with the import definitions specified in the section.
 *                        If the section is not provided or invalid, the module's imports remain unchanged.
 *                        Each import's descriptor is resolved into a corresponding module symbol.
 * @throws WebAssemblyDecodeError - Thrown when a descriptor in the import section cannot be resolved.
 * @returns This function does not return a value. It modifies the module's imports in place.
 */
function buildImports(module: WebAssemblyModule, importSection?: Section) {
  if (importSection?.type !== 'import') {
    return;
  }

  module.imports = importSection.imports.map((imp) => {
    const target = resolveDescriptor(module, imp.descriptor);
    if (!target) {
      throw new WebAssemblyDecodeError(
        `Could not resolve descriptor ${imp.descriptor}`
      );
    }
    return {
      kind: 'import',
      module: imp.module,
      name: imp.name,
      target,
    };
  });
}

/**
 * Builds the export definitions for a WebAssembly module.
 *
 * @param module - The WebAssembly module to which export definitions will be added.
 * @param exportSection - An optional section containing export information, expected to have the type 'export'.
 *                        If provided and valid, the module's exports are populated with the export definitions specified in the section.
 *                        If the section is not provided or invalid, the module's exports remain unchanged.
 *                        Each export's descriptor is resolved into a corresponding module symbol.
 * @throws WebAssemblyDecodeError - Thrown when a descriptor in the export section cannot be resolved.
 * @returns This function does not return a value. It modifies the module's exports in place.
 */
function buildExports(module: WebAssemblyModule, exportSection?: Section) {
  if (exportSection?.type !== 'export') {
    return;
  }

  module.exports = exportSection.exports.map((exp) => {
    const target = resolveDescriptor(module, exp.descriptor);
    if (!target) {
      throw new WebAssemblyDecodeError(
        `Could not resolve descriptor ${exp.descriptor}`
      );
    }
    return {
      kind: 'export',
      name: exp.name,
      target,
    };
  });
}
