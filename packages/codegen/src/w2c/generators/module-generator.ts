import consola from 'consola';
import type { W2CModule } from '../module.js';
import { BaseGenerator } from './base-generator.js';
import { generateCSources } from '../wasm2c.js';
import * as templates from '../templates/library/index.js';

export interface ModuleGeneratorOptions {
  renderMetadata?: boolean;
  forceGenerate?: boolean;
  hackAutoNumberCoerce?: boolean;
}

export class ModuleGenerator extends BaseGenerator {
  private readonly module: W2CModule;
  private readonly options: ModuleGeneratorOptions;

  public constructor(
    module: W2CModule,
    outputDirectory: string,
    options: ModuleGeneratorOptions = {}
  ) {
    super(outputDirectory);
    this.module = module;
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
    const outputPath = this.outputPathTo(this.module.name);
    const generatedFiles = [`${outputPath}.c`, `${outputPath}.h`];

    return this.generatingFromModule(generatedFiles, async () => {
      await generateCSources(this.module.sourceModulePath, outputPath);
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
      'jsi-imports-bridge.h': templates.buildImportBridgeHeader(this.module),
      'jsi-imports-bridge.cpp': templates.buildImportBridgeSource(this.module),
      'jsi-exports-bridge.h': templates.buildExportBridgeHeader(this.module),
      'jsi-exports-bridge.cpp': templates.buildExportBridgeSource(this.module, {
        hackAutoNumberCoerce: this.options.hackAutoNumberCoerce,
      }),
      'static-module.h': templates.buildStaticLibraryHeader(this.module),
      'static-module.cpp': templates.buildStaticLibrarySource(this.module),
    });
  }

  public async renderMetadata() {
    if (!this.options.renderMetadata) {
      return;
    }

    await this.writeTo(
      `${this.module.name}.exports.json`,
      JSON.stringify(this.module.generatedExports, null, 2)
    );

    await this.writeTo(
      `${this.module.name}.imports.json`,
      JSON.stringify(this.module.generatedImports, null, 2)
    );
  }

  public async generatingFromModule<R>(
    targets: string[],
    cb: () => R
  ): Promise<R | void> {
    if (this.options.forceGenerate) {
      return cb();
    }

    return this.generating<R>([this.module.sourceModulePath], targets, cb);
  }
}
