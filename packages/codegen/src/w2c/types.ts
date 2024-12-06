import type {
  ModuleExport,
  ModuleFunction,
  ModuleImport,
  ModuleSymbol,
} from '@callstack/wasm-parser';
import type { W2CCodegenImportedModule } from './codegen-context.js';

export interface GeneratedFunctionInfo {
  generatedFunctionName: string;
  parameterTypeNames: string[];
  returnTypeName: string;
}

export interface GeneratedImport<T = ModuleSymbol> extends ModuleImport<T> {
  mangledName: string;
  moduleInfo: W2CCodegenImportedModule;
}

export type GeneratedFunctionImport = GeneratedImport<ModuleFunction> &
  GeneratedFunctionInfo;

export interface GeneratedExport<T = ModuleSymbol> extends ModuleExport<T> {
  mangledName: string;
  mangledAccessorFunction: string;
}

export type GeneratedFunctionExport = GeneratedExport<ModuleFunction> &
  GeneratedFunctionInfo;
