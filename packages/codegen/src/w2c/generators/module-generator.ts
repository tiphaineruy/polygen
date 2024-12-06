import consola from 'consola';
import type { W2CModuleContext } from '../context.js';
import { BaseGenerator } from './base-generator.js';
import { generateCSources } from '../wasm2c.js';
import * as templates from '../templates/library/index.js';

export interface ModuleGeneratorOptions {
  renderMetadata?: boolean;
  forceGenerate?: boolean;
  hackAutoNumberCoerce?: boolean;
}

export class ModuleGenerator extends BaseGenerator {
  private readonly context: W2CModuleContext;
  private readonly options: ModuleGeneratorOptions;

  public constructor(
    module: W2CModuleContext,
    outputDirectory: string,
    options: ModuleGeneratorOptions = {}
  ) {
    super(outputDirectory);
    this.context = module;
    this.options = options;
  }

  public async generate(): Promise<void> {
    try {
      // TODO; remove generated files on dev (or always)
      await Promise.allSettled([
        this.generateCSource(),
        this.generateJSIBridge().catch((e) => console.error('\n', e)),
        this.renderMetadata(),
      ]);
    } catch (e) {
      consola.error(e);
    }
  }

  public async generateCSource() {
    const outputPath = this.outputPathTo(this.context.name);
    const generatedFiles = [`${outputPath}.c`, `${outputPath}.h`];

    return this.generatingFromModule(generatedFiles, async () => {
      await generateCSources(this.context.sourceModulePath, outputPath);
    });
  }

  public async copyWeakRuntimeHeader() {
    // const fullOutPath = path.join(libOutputDir, `${name}.c`);
    // await fs.copyFile(
    //   pathToRuntimeHeader,
    //   path.join(libOutputDir, 'wasm-rt.h')
    // );
  }

  public async generateJSIBridge() {
    await this.writeAllTo({
      'jsi-imports-bridge.h': templates.buildImportBridgeHeader(this.context),
      'jsi-imports-bridge.cpp': templates.buildImportBridgeSource(this.context),
      'jsi-exports-bridge.h': templates.buildExportBridgeHeader(this.context),
      'jsi-exports-bridge.cpp': templates.buildExportBridgeSource(
        this.context,
        {
          hackAutoNumberCoerce: this.options.hackAutoNumberCoerce,
        }
      ),
      'static-module.h': templates.buildStaticLibraryHeader(this.context),
      'static-module.cpp': templates.buildStaticLibrarySource(this.context),
    });
  }

  public async renderMetadata() {
    if (!this.options.renderMetadata) {
      return;
    }

    await this.writeTo(
      `${this.context.name}.exports.json`,
      JSON.stringify(this.context.codegen.exports, null, 2)
    );

    await this.writeTo(
      `${this.context.name}.imports.json`,
      JSON.stringify(this.context.codegen.imports, null, 2)
    );
  }

  public async generatingFromModule<R>(
    targets: string[],
    cb: () => R
  ): Promise<R | void> {
    if (this.options.forceGenerate) {
      return cb();
    }

    return this.generating<R>([this.context.sourceModulePath], targets, cb);
  }
}
