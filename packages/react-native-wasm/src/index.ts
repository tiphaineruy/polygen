import { Module } from './Module';
import { Instance } from './Instance';

import { compile, instantiate, validate } from './WebAssembly';
import { moduleRef } from './react-native';

const impl = {
  moduleRef,
  compile,
  instantiate,
  validate,
  Module,
  Instance,
} as const;

export type Schema = typeof impl;

export default impl;
