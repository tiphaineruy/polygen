import consola from 'consola';
import path from 'path';
import { execa } from 'execa';

const waToolkitPath = process.env.WABT_PATH;

export function validate() {
  if (!waToolkitPath) {
    consola.error(
      'WABT_PATH environment variable is not set. Set it to a directory containing WABT toolkit'
    );
    process.exit(1);
  }
}

export interface Wasm2cGenerateOptions {
  moduleName?: string;
}

export async function generateCSources(
  inputFile: string,
  outputSourceFile: string,
  options?: Wasm2cGenerateOptions
) {
  validate();

  const binary = path.join(waToolkitPath!, 'wasm2c');
  const args = [inputFile, '-o', `${outputSourceFile}.c`];

  if (options?.moduleName) {
    args.push('--module-name');
    args.push(options.moduleName);
  }

  await execa(binary, args);
}
