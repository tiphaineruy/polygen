import { type TypeName } from '@webassemblyjs/wasm-parser';

export interface ModuleImportFuncInfo {
  type: 'Function';
  module: string;
  name: string;
  params: TypeName[];
  results: TypeName[];
}

export interface ModuleExportFuncInfo {
  type: 'Function';
  name: string;
  params: TypeName[];
  results: TypeName[];
}

export interface ModuleExportMemInfo {
  type: 'Memory';
  name: string;
}

/**
 * Represents information about module's any imported symbol.
 */
export type ModuleImportInfo = ModuleImportFuncInfo;

/**
 * Represents information about module's any exported symbol.
 */
export type ModuleExportInfo = ModuleExportFuncInfo | ModuleExportMemInfo;

export type { TypeName } from '@webassemblyjs/wasm-parser';
