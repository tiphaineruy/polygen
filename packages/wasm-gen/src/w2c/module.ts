import * as path from 'node:path';
import { escapeExportName, escapeModuleName } from './utils.js';
import type {
  ModuleExportFuncInfo,
  ModuleExportInfo,
  ModuleImportFuncInfo,
  WasmModule,
} from '../webassembly/module.js';
import type { TypeName } from '@webassemblyjs/wasm-parser';

export interface AugmentedImportedFunction extends ModuleImportFuncInfo {
  cParams: string[];
  returnType: string;
  hasReturn: boolean;
}

export interface CFunctionInfo extends ModuleExportFuncInfo {
  returnType: string;
  hasReturn: boolean;
  generatedCFunctionName: string;
}

export class W2CModule {
  public readonly name: string;
  public readonly escapedName: string;
  public readonly wasmModule: WasmModule;

  constructor(module: WasmModule) {
    this.wasmModule = module;
    this.name = path.basename(module.sourceModulePath, '.wasm');
    this.escapedName = escapeModuleName(this.name);
  }

  /**
   * Creates a generators that yields all exported functions.
   */
  *getExportedFunctions() {
    for (const exportedFunction of this.wasmModule.getExportedFunctions()) {
      yield this.getCFunctionFor(exportedFunction);
    }
  }

  /**
   * Creates a generators that yields all exported functions.
   */
  *getImportedFunctions(): Generator<AugmentedImportedFunction> {
    function matchW2CRType(t?: TypeName) {
      if (!t) {
        return 'void';
      }

      if (t.startsWith('u') || t.startsWith('i')) {
        return 'u32';
      }
      return 'f64';
    }

    // TODO: workaround a bug that all types are returned as either none, u32 or f64
    for (const importedFunc of this.wasmModule.getImportedFunctions()) {
      const returnType = matchW2CRType(importedFunc.results[0]);
      yield {
        ...importedFunc,
        cParams: importedFunc.params.map(matchW2CRType),
        returnType,
        hasReturn: importedFunc.results.length > 0,
      };
    }
  }

  /**
   * @param exportedFunction
   */
  getCFunctionFor(exportedFunction: ModuleExportInfo): CFunctionInfo {
    function matchW2CRType(t?: TypeName) {
      if (!t) {
        return 'void';
      }

      if (t.startsWith('u') || t.startsWith('i')) {
        return 'u32';
      }
      return 'f64';
    }

    const returnType = matchW2CRType(exportedFunction.results[0]);
    return {
      ...exportedFunction,
      returnType,
      hasReturn: exportedFunction.results.length > 0,
      generatedCFunctionName: `w2c_${this.escapedName}_${escapeExportName(exportedFunction.name)}`,
    };
  }
}
