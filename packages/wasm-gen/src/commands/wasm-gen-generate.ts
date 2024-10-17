#!/usr/bin/env node
import { program } from 'commander';
import consola from 'consola';
import { glob } from 'glob';
import { execa } from 'execa';
import fs from 'node:fs/promises';
import chalk from 'chalk';
import { findProjectRoot } from '../api/project.js';
import path from 'path';

program
  .name('wasm-gen-generate')
  .description('Generates React Native Modules from Wasm');

program.action(async () => {
  const waToolkitPath = process.env.WABT_PATH;
  if (!waToolkitPath) {
    consola.error(
      'WABT_PATH environment variable is not set. Set it to a directory containing WABT toolkit'
    );
    return;
  }

  const projectRoot = await findProjectRoot();
  console.log('Found project directory', projectRoot);
  const modules = await glob('wasm/*.wasm', { cwd: projectRoot });
  const wasm2c = path.join(waToolkitPath, 'wasm2c');

  for (const mod of modules) {
    console.log('Processing WebAssembly module: ', chalk.bold(mod));
    const name = path.basename(mod, '.wasm');
    const fullInPath = path.join(projectRoot, mod);
    const outDir = path.join(projectRoot, 'node_modules', '.generated', name);
    await fs.mkdir(outDir, { recursive: true });
    const fullOutPath = path.join(outDir, `${name}.c`);
    await execa(wasm2c, [fullInPath, '-o', fullOutPath]);
  }
});

program.parse(process.argv);
