import path from 'path';
import { Liquid } from 'liquidjs';
import { W2CModule } from './module.js';
import { WasmModule } from '../webassembly/module.js';
import { escapeExportName, escapeModuleName } from './utils.js';
import { ModuleGenerator } from './generators/module-generator.js';
import { HostGenerator } from './generators/host-generator.js';

const UMBRELLA_PROJECT_NAME = '@host';

export interface W2CGeneratorOptions {
  // TODO: Make it local to the w2c
  templateDirectory: string;
  assetsDirectory: string;

  /**
   * Path to output directory where generated files will be created.
   *
   * Directories for specific modules will be created within this
   * directory.
   */
  outputDirectory: string;

  /**
   * If true, all modules are built into single turbo module.
   *
   * This can increase build times if one of the WASM module was changed.
   * This only works with static linking.
   *
   * TODO: Currently only this works
   */
  singleProject?: boolean;
}

/**
 * Class that encapsulates Code generation logic.
 */
export class W2CGenerator {
  private readonly options: W2CGeneratorOptions;
  private readonly templateEngine: Liquid;

  public constructor(options: W2CGeneratorOptions) {
    this.options = options;
    this.options.singleProject ??= true;
    this.templateEngine = this._createEngine(options);
  }

  /**
   * Generates all code for specified WebAssembly module.
   *
   * @param module
   */
  public async generateModule(module: WasmModule): Promise<W2CModule> {
    const w2cModule = new W2CModule(module);
    const moduleOutputDir = this.outputPathForModule(w2cModule);

    const moduleGenerator = new ModuleGenerator(
      w2cModule,
      moduleOutputDir,
      this.templateEngine
    );

    await moduleGenerator.generate();
    return w2cModule;
  }

  /**
   * Generates all code for specified WebAssembly module.
   */
  public async generateHostModule(modules: W2CModule[]) {
    const moduleOutputDir = path.join(
      this.options.outputDirectory,
      UMBRELLA_PROJECT_NAME
    );
    const hostGenerator = new HostGenerator(
      modules,
      this.options.assetsDirectory,
      moduleOutputDir,
      this.templateEngine
    );

    return await hostGenerator.generate();
  }

  private _createEngine(options: W2CGeneratorOptions): Liquid {
    const engine = new Liquid({
      root: options.templateDirectory,
      // strictVariables: true,
      // strictFilters: true,
    });

    engine.registerFilter('escape_module_name', (value: string) =>
      escapeModuleName(value)
    );
    engine.registerFilter('escape_export_name', (value: string) =>
      escapeExportName(value)
    );

    return engine;
  }

  protected outputPathForModule(module: W2CModule) {
    if (this.options.singleProject) {
      return path.join(
        this.options.outputDirectory,
        UMBRELLA_PROJECT_NAME,
        module.name
      );
    }

    return path.join(this.options.outputDirectory, module.name, 'gen');
  }
}
