import WebAssemblyImpl from './index';
import type { Schema } from './index';

declare global {
  // We must use `var` here for declaration to work
  var WebAssembly: Readonly<Schema>;
}

global.WebAssembly = Object.freeze(WebAssemblyImpl) as any;
