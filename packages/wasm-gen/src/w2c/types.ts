import type {
  ModuleExportFuncInfo,
  ModuleExportMemInfo,
  ModuleImportFuncInfo,
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

export type GeneratedImport = GeneratedFunctionImport;

export interface GeneratedFunctionExport extends ModuleExportFuncInfo {
  mangledName: string;
  generatedFunctionName: string;
  parameterTypeNames: string[];
  returnTypeName: string;
  hasReturn: boolean;
}

export interface GeneratedMemoryExport extends ModuleExportMemInfo {
  mangledName: string;
  mangledAccessorFunction: string;
}

export type GeneratedExport = GeneratedFunctionExport | GeneratedMemoryExport;
