import path from 'path';
import { Liquid } from 'liquidjs';
import { W2CModule } from './module.js';
import { WasmModule } from '../webassembly/module.js';
import { escapeExportName, escapeModuleName } from './utils.js';
import { ModuleGenerator } from './generators/module-generator.js';
import { HostGenerator } from './generators/host-generator.js';

export interface W2CGeneratorOptions {
  templateDirectory: string;
  assetsDirectory: string;
  outputDirectory: string;
}

/**
 * Class that encapsulates Code generation logic.
 */
export class W2CGenerator {
  private readonly options: W2CGeneratorOptions;
  private readonly templateEngine: Liquid;

  public constructor(options: W2CGeneratorOptions) {
    this.options = options;
    this.templateEngine = this._createEngine(options);
  }

  /**
   * Generates all code for specified WebAssembly module.
   *
   * @param module
   */
  public async generateModule(module: WasmModule): Promise<W2CModule> {
    const w2cModule = new W2CModule(module);

    const moduleOutputDir = path.join(
      this.options.outputDirectory,
      w2cModule.name
    );

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
    const moduleOutputDir = path.join(this.options.outputDirectory, '@host');
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
}
