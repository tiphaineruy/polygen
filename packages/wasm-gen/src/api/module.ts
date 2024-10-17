import { readFile } from 'node:fs/promises';
// @ts-ignore
import { decode } from '@webassemblyjs/wasm-parser';

export async function processWasmModule(path: string) {
  const file = await readFile(path);
  const parsedModule = decode(file);
  generateMetadata(parsedModule);
}

function generateMetadata(_module: any) {
  return {};
}
