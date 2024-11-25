import { W2CModule } from '../module.js';
import { BaseGenerator } from './base-generator.js';
import * as templates from '../templates/host.js';

export class HostGenerator extends BaseGenerator {
  private readonly modules: W2CModule[];

  public constructor(modules: W2CModule[], outputDirectory: string) {
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
      'mediator.h': templates.buildHostHeader(),
      'mediator.cpp': templates.buildHostSource(this.modules),
      'ReactNativeWebAssemblyHost.podspec': templates.buildPodspec(),
    });
  }
}
