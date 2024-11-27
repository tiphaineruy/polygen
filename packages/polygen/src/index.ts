import { makeModuleName } from './internal';
import { compile, instantiate, validate } from './WebAssembly';
import { Module } from './Module';
import { Instance } from './Instance';
import { Memory } from './Memory';
import { Global } from './Global';

const impl = {
  compile,
  instantiate,
  validate,
  Module,
  Instance,
  Memory,
  Global,
} as const;

export type Schema = typeof impl;

export function register() {
  // @ts-ignore
  global.WebAssembly = Object.freeze(impl) as any;
}

export const WebAssembly = impl;

/**
 * Allows to reference a module by its name.
 *
 * @param name
 */
export function moduleRef(name: string): ArrayBuffer {
  return makeModuleName(name);
}
