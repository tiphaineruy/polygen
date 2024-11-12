import WebAssemblyImpl from './index';
import type { Schema } from './index';

declare global {
  // We must use `var` here for declaration to work
  // @ts-ignore
  var WebAssembly: Readonly<Schema>;
}

// @ts-ignore
global.WebAssembly = Object.freeze(WebAssemblyImpl) as any;
