import type {
  DescriptorIdentifier,
  ModuleField,
  ModuleFunction,
  ModuleGlobal,
  ModuleMemory,
  ModuleTable,
} from '@webassemblyjs/wasm-parser';

/**
 * Helper type for symbol cache map.
 */
export class LookupCache {
  public readonly functions: Map<string, ModuleFunction>;
  public readonly globals: Map<string, ModuleGlobal>;
  public readonly tables: Map<string, ModuleTable>;
  public readonly memories: Map<string, ModuleMemory>;

  constructor(
    functions: Map<string, ModuleFunction>,
    globals: Map<string, ModuleGlobal>,
    tables: Map<string, ModuleTable>,
    memories: Map<string, ModuleMemory>
  ) {
    this.functions = functions;
    this.globals = globals;
    this.tables = tables;
    this.memories = memories;
  }

  public getFunction(
    identifier: DescriptorIdentifier
  ): ModuleFunction | undefined {
    return this._get(this.functions, identifier, 'func') as
      | ModuleFunction
      | undefined;
  }

  public getGlobal(identifier: DescriptorIdentifier): ModuleGlobal | undefined {
    return this._get(this.globals, identifier, 'global') as
      | ModuleGlobal
      | undefined;
  }

  public getMemory(identifier: DescriptorIdentifier): ModuleMemory | undefined {
    return this._get(this.memories, identifier, 'memory') as
      | ModuleMemory
      | undefined;
  }

  public getTable(identifier: DescriptorIdentifier): ModuleTable | undefined {
    return this._get(this.tables, identifier, 'table') as
      | ModuleTable
      | undefined;
  }

  private _get<T>(
    target: Map<string, T>,
    identifier: DescriptorIdentifier,
    prefix: string
  ): T | undefined {
    switch (identifier.type) {
      case 'Identifier':
        return target.get(identifier.value);
      case 'NumberLiteral':
        return target.get(`${prefix}_${identifier.raw}`);
    }
  }
}

/**
 * Creates a `Map` object with found function types for faster lookup.
 */
export function buildLookupCache(fields: ModuleField[]): LookupCache {
  const funcs = new Map<string, ModuleFunction>();
  const globals = new Map<string, ModuleGlobal>();
  const memories = new Map<string, ModuleMemory>();
  const tables = new Map<string, ModuleTable>();

  // Build map of funcs
  for (const field of fields) {
    switch (field.type) {
      case 'Func':
        funcs.set(field.name.value, field);
        break;
      case 'Global':
        if (field.name) {
          globals.set(field.name.value.toString(), field);
        }
        break;
      case 'Table':
        tables.set(field.name.value.toString(), field);
        break;
      case 'Memory':
        memories.set(field.id.value.toString(), field);
        break;
    }
  }

  return new LookupCache(funcs, globals, tables, memories);
}
