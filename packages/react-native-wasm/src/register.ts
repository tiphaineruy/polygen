import * as WebAssemblyImpl from './WebAssembly';

declare global {
  // We must use `var` here for declaration to work
  var WebAssembly: typeof WebAssemblyImpl;
}

global.WebAssembly = Object.freeze(WebAssemblyImpl);
