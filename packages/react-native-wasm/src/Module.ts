import NativeWASM, {
  type OpaqueModuleNativeHandle,
  type InternalModuleMetadata,
  type ModuleExportDescriptor,
  type ModuleImportDescriptor,
} from './NativeWebAssembly';

/**
 * @spec https://webassembly.github.io/spec/js-api/index.html#modules
 */
export class Module {
  public name: string;
  public nativeHandle: OpaqueModuleNativeHandle;
  #metadata: InternalModuleMetadata;

  public constructor(name: string) {
    this.name = name;
    this.nativeHandle = NativeWASM.loadModule(name);
    this.#metadata = NativeWASM.getModuleMetadata(name);
  }

  public static imports(mod: Module): ModuleImportDescriptor[] {
    return mod.#metadata.imports;
  }

  public static exports(mod: Module): ModuleExportDescriptor[] {
    return mod.#metadata.exports;
  }
}
