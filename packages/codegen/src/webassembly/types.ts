import type { ModuleLimits, TypeName } from '@webassemblyjs/wasm-parser';

export interface ModuleImportFuncInfo {
  type: 'Function';
  module: string;
  name: string;
  params: TypeName[];
  results: TypeName[];
}

export interface ModuleImportGlobalInfo {
  type: 'Global';
  module: string;
  name: string;
  variableType: TypeName;
  isMutable: boolean;
}

export interface ModuleExportFuncInfo {
  type: 'Function';
  name: string;
  params: TypeName[];
  results: TypeName[];
}

export interface ModuleExportMemoryInfo {
  type: 'Memory';
  name: string;
}

export interface ModuleExportGlobalInfo {
  type: 'Global';
  name: string;
  variableType: TypeName;
  isMutable: boolean;
}

export interface ModuleExportTableInfo {
  type: 'Table';
  name: string;
  limits: ModuleLimits;
  elementType: 'anyfunc';
}

/**
 * Represents information about module's any imported symbol.
 */
export type ModuleImportInfo = ModuleImportFuncInfo | ModuleImportGlobalInfo;

/**
 * Represents information about module's any exported symbol.
 */
export type ModuleExportInfo =
  | ModuleExportFuncInfo
  | ModuleExportMemoryInfo
  | ModuleExportGlobalInfo
  | ModuleExportTableInfo;

export type { TypeName } from '@webassemblyjs/wasm-parser';
