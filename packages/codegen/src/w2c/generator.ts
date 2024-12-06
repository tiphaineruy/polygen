import path from 'path';
import { W2CModuleContext } from './context.js';
import { ModuleGenerator } from './generators/module-generator.js';
import { HostGenerator } from './generators/host-generator.js';
import fs from 'node:fs/promises';

const UMBRELLA_PROJECT_NAME = '@host';

/**
 * Options used to change W2CGenerator behavior.
 */
export interface W2CGeneratorOptions {
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
   *
   * @defaultValue true
   */
  singleProject?: boolean;

  /**
   * If true, generated files are re-generated and written
   * even if stale.
   *
   * @defaultValue false
   */
  forceGenerate?: boolean;

  /**
   * If true, additional debug metadata files are generated alongside
   * output source files.
   *
   * @defaultValue false
   */
  generateMetadata?: boolean;

  hackAutoNumberCoerce?: boolean;
}

/**
 * Class that encapsulates Code generation logic.
 */
export class W2CGenerator {
  private readonly options: W2CGeneratorOptions;

  public constructor(options: W2CGeneratorOptions) {
    this.options = options;
    this.options.singleProject ??= true;
  }

  /**
   * Generates all code for specified WebAssembly module.
   *
   * @param module
   */
  public async generateModule(modulePath: string): Promise<W2CModuleContext> {
    const moduleContents = await fs.readFile(modulePath, { encoding: null });
    const moduleContext = new W2CModuleContext(
      moduleContents.buffer as ArrayBuffer,
      modulePath
    );
    const moduleOutputDir = this.outputPathForModule(moduleContext);

    const moduleGenerator = new ModuleGenerator(
      moduleContext,
      moduleOutputDir,
      {
        renderMetadata: this.options.generateMetadata,
        forceGenerate: this.options.forceGenerate,
        hackAutoNumberCoerce: this.options.hackAutoNumberCoerce,
      }
    );
    await moduleGenerator.generate();
    return moduleContext;
  }

  /**
   * Generates all code for specified WebAssembly module.
   */
  public async generateHostModule(modules: W2CModuleContext[]) {
    const moduleOutputDir = path.join(
      this.options.outputDirectory,
      UMBRELLA_PROJECT_NAME
    );
    const hostGenerator = new HostGenerator(modules, moduleOutputDir);

    return await hostGenerator.generate();
  }

  protected outputPathForModule(module: W2CModuleContext) {
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
