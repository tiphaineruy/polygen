import * as path from 'node:path';
import { mangleName, mangleModuleName } from './mangle.js';
import type { TypeName } from '@webassemblyjs/wasm-parser';
import { WebAssemblyModule } from '../webassembly/module.js';
import type {
  GeneratedExport,
  GeneratedFunctionExport,
  GeneratedFunctionImport,
  GeneratedImport,
  GeneratedMemoryExport,
  ImportedModuleInfo,
} from './types.js';
import type {
  ModuleExportFuncInfo,
  ModuleImportFuncInfo,
} from '../webassembly/types.js';

export class W2CModule extends WebAssemblyModule {
  /**
   * Name of the module, based on the filename.
   *
   * Unsafe to use as a symbol in source code, use `mangledName` instead.
   */
  public readonly name: string;

  /**
   * Mangled module name, safe to use in source code as a symbol name.
   */
  public readonly mangledName: string;

  /**
   * Name of the generated classNAme
   */
  public readonly generatedClassName: string;

  private readonly importedModulesInfo: Record<string, ImportedModuleInfo>;

  /**
   * Collection of generated module imports made by `wasm2c` tool.
   */
  public readonly generatedImports: GeneratedImport[];

  /**
   * Collection of generated module exports made by `wasm2c` tool.
   */
  public readonly generatedExports: GeneratedExport[];

  constructor(module: WebAssemblyModule) {
    super(module.sourceModulePath, module.imports, module.exports);
    this.name = path.basename(module.sourceModulePath, '.wasm');
    this.mangledName = mangleModuleName(this.name);
    this.generatedClassName = capitalize(this.mangledName);
    this.importedModulesInfo = this.processImportedModulesInfo();
    this.generatedImports = this.processImports();
    this.generatedExports = this.processExports();
  }

  public get importedModules() {
    return Object.values(this.importedModulesInfo).toReversed();
  }

  public get moduleFactoryFunctionName(): string {
    return `create${this.generatedClassName}Module`;
  }

  public get contextClassName(): string {
    return `${this.generatedClassName}ModuleContext`;
  }

  public *getGeneratedExportedMemories(): Generator<GeneratedMemoryExport> {
    for (const ex of this.generatedExports) {
      if (ex.type === 'Memory') {
        yield ex;
      }
    }
  }

  public *getGeneratedExportedFunctions(): Generator<GeneratedFunctionExport> {
    for (const ex of this.generatedExports) {
      if (ex.type === 'Function') {
        yield ex;
      }
    }
  }

  public get generatedContextTypeName(): string {
    return `w2c_${this.mangledName}`;
  }

  private processImportedModulesInfo() {
    const importedModuleNames = new Set(
      this.imports.values().map((i) => i.module)
    );

    const importsInfo = importedModuleNames
      .values()
      .map((name): [string, ImportedModuleInfo] => [
        name,
        {
          name: name,
          mangledName: mangleModuleName(name),
          generatedContextTypeName: `w2c_${mangleModuleName(name)}`,
          generatedRootContextFieldName: `import_${mangleModuleName(name)}Ctx`,
        },
      ]);
    return Object.fromEntries(importsInfo);
  }

  private processImports(): GeneratedImport[] {
    const iter = this.imports.values().map((el) => {
      switch (el.type) {
        case 'Function':
          return this.buildImportedFunction(el);
      }
    });

    return [...iter];
  }

  private processExports(): GeneratedExport[] {
    const iter = this.exports.values().map((el) => {
      switch (el.type) {
        case 'Function':
          return this.buildExportedFunction(el);
        default:
          return {
            ...el,
            mangledName: mangleName(el.name),
            mangledAccessorFunction: this.mangleFunction(el.name),
          };
      }
    });

    return [...iter];
  }

  private buildImportedFunction(
    func: ModuleImportFuncInfo
  ): GeneratedFunctionImport {
    const importInfo = this.importedModulesInfo[func.module];
    if (!importInfo) {
      console.log(this.importedModulesInfo);
      throw new Error(
        `Assert error: could not get import info for ${func.module}`
      );
    }

    return {
      ...this.buildGeneratedFunction(func),
      moduleInfo: importInfo,
      generatedFunctionName: this.mangleFunction(
        func.name,
        importInfo.mangledName
      ),
    };
  }

  private buildExportedFunction(
    func: ModuleExportFuncInfo
  ): GeneratedFunctionExport {
    return this.buildGeneratedFunction(func);
  }

  private mangleFunction(
    name: string,
    mangledModule: string = this.mangledName
  ) {
    return `w2c_${mangledModule}_${mangleName(name)}`;
  }

  private buildGeneratedFunction<
    T extends ModuleExportFuncInfo | ModuleImportFuncInfo,
  >(func: T) {
    const returnType = matchW2CRType(func.results[0]);

    return {
      ...func,
      mangledName: mangleName(func.name),
      generatedFunctionName: this.mangleFunction(func.name),
      parameterTypeNames: func.params.map(matchW2CRType),
      returnTypeName: returnType,
      hasReturn: func.results.length > 0,
    };
  }
}

// TODO: workaround a bug(?) that all types are returned as either none, u32 or f64
function matchW2CRType(t?: TypeName) {
  if (!t) {
    return 'void';
  }

  if (t.startsWith('u') || t.startsWith('i')) {
    return 'u32';
  }
  return 'f64';
}

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
