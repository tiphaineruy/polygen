import { W2CModuleContext } from '../context.js';
import { BaseGenerator } from './base-generator.js';
import * as templates from '../templates/host.js';

export class HostGenerator extends BaseGenerator {
  private readonly modules: W2CModuleContext[];

  public constructor(modules: W2CModuleContext[], outputDirectory: string) {
    super(outputDirectory);
    this.modules = modules;
  }

  public async generate(): Promise<void> {
    await Promise.allSettled([this.copyWasmRuntime(), this.renderMediator()]);
  }

  public async copyWasmRuntime() {
    return this.copyAsset('wasm-rt');
  }

  public async renderMediator() {
    await this.writeAllTo({
      'loader.h': templates.buildHostHeader(),
      'loader.cpp': templates.buildHostSource(this.modules),
      'ReactNativeWebAssemblyHost.podspec': templates.buildPodspec(),
    });
  }
}
