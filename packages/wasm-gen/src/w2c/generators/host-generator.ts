import fs from 'node:fs/promises';
import { Liquid } from 'liquidjs';
import { W2CModule } from '../module.js';
import { BaseGenerator } from './base-generator.js';
import path from 'path';

export class HostTemplateContext {
  public readonly generatedModules: W2CModule[];

  public constructor(generatedModules: W2CModule[]) {
    this.generatedModules = generatedModules;
  }
}

export class HostGenerator extends BaseGenerator<HostTemplateContext> {
  private readonly modules: W2CModule[];
  private readonly assetsDirectory: string;

  public constructor(
    modules: W2CModule[],
    assetsDirectory: string,
    outputDirectory: string,
    templateEngine: Liquid
  ) {
    super(outputDirectory, new HostTemplateContext(modules), templateEngine);
    this.modules = modules;
    this.assetsDirectory = assetsDirectory;
  }

  public async generate(): Promise<void> {
    await Promise.allSettled([this.copyWasmRuntime(), this.renderMediator()]);
  }

  public async copyWasmRuntime() {
    await fs.cp(
      path.join(this.assetsDirectory, 'wasm-rt'),
      this.outputPathTo('wasm-rt'),
      { recursive: true, errorOnExist: false }
    );
  }

  public async renderMediator() {
    await this.renderAllTo({
      'host/mediator.h': 'mediator.h',
      'host/mediator.cpp': 'mediator.cpp',
      'host/Host.podspec': 'ReactNativeWebAssemblyHost.podspec',
    });
  }
}
