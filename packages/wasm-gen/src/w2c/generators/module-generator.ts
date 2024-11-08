import fs from 'node:fs/promises';
import { Liquid } from 'liquidjs';
import type {
  AugmentedImportedFunction,
  CFunctionInfo,
  W2CModule,
} from '../module.js';
import { BaseGenerator } from './base-generator.js';
import { generateCSources } from '../wasm2c.js';
import consola from 'consola';

export class ModuleTemplateContext {
  public readonly moduleName: string;
  public readonly moduleSafeName: string;
  public readonly moduleContextCTypeName: string;
  public readonly exportedFunctions: CFunctionInfo[];
  public readonly importModuleNames: string[];
  public readonly importedFunctions: AugmentedImportedFunction[];

  public constructor(module: W2CModule) {
    this.moduleName = module.name;
    this.moduleSafeName = module.escapedName;
    this.moduleContextCTypeName = `w2c_${module.escapedName}`;
    this.exportedFunctions = [...module.getExportedFunctions()];
    this.importModuleNames = [...module.wasmModule.imports.keys()];
    this.importedFunctions = [...module.getImportedFunctions()];
  }
}

export class ModuleGenerator extends BaseGenerator<ModuleTemplateContext> {
  private readonly module: W2CModule;

  public constructor(
    module: W2CModule,
    outputDirectory: string,
    templateEngine: Liquid
  ) {
    super(outputDirectory, new ModuleTemplateContext(module), templateEngine);
    this.module = module;
  }

  public async generate(): Promise<void> {
    try {
      // TODO; remove generated files on dev (or always)
      await Promise.allSettled([
        this.generateCSource(),
        this.renderImportsBridge(),
        this.renderExportsBridge(),
        // this.renderMetadata(),
      ]);
    } catch (e) {
      consola.error(e);
    }
  }

  public async generateCSource() {
    // TODO: generate only if needed (check mod time)
    const outputPath = this.outputPathTo('gen', this.module.name);
    // const generatedFiles = [`${outputPath}.c`, `${outputPath}.h`];

    // return this.generatingFromModule(generatedFiles, () => {
    await generateCSources(this.module.wasmModule.sourceModulePath, outputPath);
    // });
  }

  public async copyWeakRuntimeHeader() {
    // const fullOutPath = path.join(libOutputDir, `${name}.c`);
    // await fs.copyFile(
    //   pathToRuntimeHeader,
    //   path.join(libOutputDir, 'wasm-rt.h')
    // );
  }

  public async renderImportsBridge() {
    return await this.renderAllTo({
      'lib/jsi-imports-bridge.h': 'gen/jsi-imports-bridge.h',
      'lib/jsi-imports-bridge.cpp': 'gen/jsi-imports-bridge.cpp',
    });
  }

  public async renderExportsBridge() {
    return await this.renderAllTo({
      'lib/jsi-exports-bridge.h': 'gen/jsi-exports-bridge.h',
      'lib/jsi-exports-bridge.cpp': 'gen/jsi-exports-bridge.cpp',
    });
  }

  public async renderMetadata() {
    // TODO: hide behind a flag
    await fs.writeFile(
      this.outputPathTo(`${this.module.name}.exports.json`),
      JSON.stringify([...this.module.getExportedFunctions()], null, 2)
    );

    await fs.writeFile(
      this.outputPathTo(`${this.module.name}.imports.json`),
      JSON.stringify([...this.module.wasmModule.getImports()], null, 2)
    );

    await fs.writeFile(
      this.outputPathTo(`${this.module.name}.metadata.json`),
      JSON.stringify(this.module.wasmModule.fields, null, 2)
    );
  }

  public async generatingFromModule<R>(
    targets: string[],
    cb: () => R
  ): Promise<R | void> {
    return this.generating<R>(
      [this.module.wasmModule.sourceModulePath],
      targets,
      cb
    );
  }
}
