import type {
  ModuleExportFuncInfo,
  ModuleExportGlobalInfo,
  ModuleExportMemoryInfo,
  ModuleExportTableInfo,
  ModuleImportFuncInfo,
  ModuleImportGlobalInfo,
} from '../webassembly/types.js';

export interface ImportedModuleInfo {
  name: string;
  mangledName: string;
  generatedContextTypeName: string;
  generatedRootContextFieldName: string;
}

export interface GeneratedFunctionImport extends ModuleImportFuncInfo {
  mangledName: string;
  moduleInfo: ImportedModuleInfo;
  generatedFunctionName: string;
  parameterTypeNames: string[];
  returnTypeName: string;
  hasReturn: boolean;
}

export interface GeneratedGlobalImport extends ModuleImportGlobalInfo {
  mangledName: string;
  moduleInfo: ImportedModuleInfo;
}

export type GeneratedImport = GeneratedFunctionImport | GeneratedGlobalImport;

export interface GeneratedFunctionExport extends ModuleExportFuncInfo {
  mangledName: string;
  generatedFunctionName: string;
  parameterTypeNames: string[];
  returnTypeName: string;
  hasReturn: boolean;
}

export interface GeneratedMemoryExport extends ModuleExportMemoryInfo {
  mangledName: string;
  mangledAccessorFunction: string;
}

export interface GeneratedGlobalExport extends ModuleExportGlobalInfo {
  mangledName: string;
  mangledAccessorFunction: string;
}

export interface GeneratedTableExport extends ModuleExportTableInfo {
  mangledName: string;
  mangledAccessorFunction: string;
}

export type GeneratedExport =
  | GeneratedFunctionExport
  | GeneratedMemoryExport
  | GeneratedGlobalExport
  | GeneratedTableExport;
