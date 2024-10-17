import NativeWASM from './NativeWebAssembly';
import type {
  InternalModuleMetadata,
  ModuleExportDescriptor,
  ModuleImportDescriptor,
} from './NativeWebAssembly';

/**
 * @spec https://webassembly.github.io/spec/js-api/index.html#modules
 */
export class Module {
  public name: string;
  #metadata: InternalModuleMetadata;

  public constructor(name: string) {
    this.name = name;
    this.#metadata = NativeWASM.getModuleMetadata(name);
  }

  public static imports(mod: Module): ModuleImportDescriptor[] {
    return mod.#metadata.imports;
  }

  public static exports(mod: Module): ModuleExportDescriptor[] {
    return mod.#metadata.exports;
  }
}
