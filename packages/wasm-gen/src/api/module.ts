import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
// @ts-ignore
import { decode } from '@webassemblyjs/wasm-parser';

interface Result {
  type: string;
  body: Module[];
}

interface Module {
  type: 'module';
  id: string;
  fields: ModuleField[];
  metadata: any;
}

type TypeName = 'i32' | 'i64' | 'u32' | 'u64' | 'f32' | 'f64';

type ModuleField = ModuleFunction | ModuleImport | ModuleExport;

interface ModuleFunctionName {
  type: 'Identifier';
  value: string;
  raw: string;
}

interface ModuleFunctionSignature {
  type: 'Signature';
  params: { valtype: TypeName }[];
  results: TypeName[];
}

interface ModuleFunction {
  type: 'Func';
  name: ModuleFunctionName;
  signature: ModuleFunctionSignature;
  body: number[];
}

type ModuleImportDescriptor = ModuleFuncImportDescriptor;

interface ModuleFuncImportDescriptor {
  type: 'FuncImportDescr';
  id: string;
  signature: ModuleFunctionSignature;
}
interface ModuleExportDescriptor {
  type: 'FuncExportDescr';
  exportType: string;
  id: { type: 'NumberLiteral'; value: number; raw: string };
}

interface ModuleImport {
  type: 'ModuleImport';
  module: string;
  name: string;
  descr: ModuleImportDescriptor;
  loc: any;
}

interface ModuleExport {
  type: 'ModuleExport';
  name: string;
  descr: ModuleExportDescriptor;
  loc: any;
}

export class ModuleInfo {
  private readonly _name: string;
  private readonly _escapedName: string;
  private readonly _fields: ModuleField[];
  private readonly _funcs: Map<string, ModuleFunctionSignature> = new Map();

  constructor(name: string, metadata: Result) {
    this._name = name;
    this._escapedName = escapeModuleName(name);
    console.log('escaped name: ', this._escapedName);
    this._fields = metadata.body[0]?.fields ?? [];

    // Build map of funcs
    for (const field of this._fields) {
      if (field.type === 'Func') {
        this._funcs.set(field.name.value, field.signature);
      }
    }
  }

  static async fromWASM(wasmPath: string): Promise<ModuleInfo> {
    const file = await readFile(wasmPath);
    const name = path.basename(wasmPath, '.wasm');
    const decodeOptions = { ignoreCodeSection: true, ignoreDataSection: true };
    const parsedModule = decode(file, decodeOptions) as Result;
    return new ModuleInfo(name, parsedModule);
  }

  public get exports(): (any | null)[] {
    const exportFields = this._fields.filter((a) => a.type === 'ModuleExport');
    return exportFields
      .map((ex) => {
        if (ex.descr.exportType === 'Func') {
          const sig = this._funcs.get(`func_${ex.descr.id.raw}`);

          if (!sig) {
            console.warn(`Could not find export signature for: ${ex.name}`);
            return null;
          }

          return {
            name: ex.name,
            type: 'func',
            generated_c_func_name: `w2c_${this._escapedName}_${escapeExportName(ex.name)}`,
            params: sig.params.map((e) => e.valtype),
            results: sig.results,
          };
        }

        console.warn('Found unknown export type: ', ex.descr.exportType);
        return null;
      })
      .filter((e) => e !== null);
  }
}

function escapeNonAsciiChar(c: string) {
  return '0x' + (c.codePointAt(0) ?? 0).toString(16).toUpperCase();
}

function escapeModuleName(name: string): string {
  name = name.replace(/_/g, '__');
  name = name.replace(/[^[a-zA-Z0-9_]/, escapeNonAsciiChar);
  return name;
}

function escapeExportName(name: string): string {
  name = name.replace(/^_(?=_)/, escapeNonAsciiChar);
  return name;
}
