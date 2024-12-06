import * as path from 'node:path';
import { mangleModuleName } from './mangle.js';
import { computeChecksumBuffer } from '../utils/checksum.js';
import { Module } from '@callstack/wasm-parser';
import { W2CModuleCodegenContext } from './codegen-context.js';

/**
 * Represents the context of a WebAssembly module, providing metadata such as
 * its name, file path, and checksum.
 */
export class W2CModuleContext {
  /**
   * Name of the module, based on the filename.
   *
   * Unsafe to use as a symbol in source code, use `mangledName` instead.
   */
  public readonly name: string;

  /**
   * Path to the file that the metadata was loaded from.
   */
  public readonly sourceModulePath: string;

  /**
   * SHA-256 checksum of module contents
   */
  public readonly checksum: Buffer;

  /**
   * The parsed WebAssembly module.
   */
  public readonly module: Module;

  /**
   * Context for the wasm2c C code generation.
   */
  public readonly codegen: W2CModuleCodegenContext;

  /**
   * Context for the TurboModule code generation.
   */
  public readonly turboModule: W2CModuleTurboModuleContext;

  constructor(moduleBuffer: ArrayBuffer, sourceModulePath: string) {
    this.name = path.basename(sourceModulePath, '.wasm');
    this.module = new Module(moduleBuffer);
    this.sourceModulePath = sourceModulePath;
    this.checksum = computeChecksumBuffer(moduleBuffer);
    this.codegen = new W2CModuleCodegenContext(this.name, this.module);
    this.turboModule = new W2CModuleTurboModuleContext(this.name);
  }
}

/**
 * W2CModuleTurboModuleContext is a utility class designed to manage the generation of
 * class and function names related to React Native TurboModule bridging.
 * It provides structured naming conventions for module factory functions and context classes
 * based on a given module name.
 */
export class W2CModuleTurboModuleContext {
  public readonly generatedClassName: string;

  constructor(name: string) {
    this.generatedClassName = capitalize(mangleModuleName(name));
  }

  /**
   * Name of the function that creates a new instance of the module.
   */
  public get moduleFactoryFunctionName(): string {
    return `create${this.generatedClassName}Module`;
  }

  /**
   * Name of the class that represents the module context.
   */
  public get contextClassName(): string {
    return `${this.generatedClassName}ModuleContext`;
  }
}

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
