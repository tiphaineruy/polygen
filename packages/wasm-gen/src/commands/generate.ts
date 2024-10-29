#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import consola from 'consola';
import { glob } from 'glob';
import { execa } from 'execa';
import fs from 'node:fs/promises';
import chalk from 'chalk';
import path from 'path';
import { Liquid } from 'liquidjs';
import { findProjectRoot } from '../api/project.js';

const command = new Command('generate').description(
  'Generates React Native Modules from Wasm'
);

const ROOT_DIR = path.join(fileURLToPath(import.meta.url), '../../..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');

command.action(async () => {
  const waToolkitPath = process.env.WABT_PATH;
  if (!waToolkitPath) {
    consola.error(
      'WABT_PATH environment variable is not set. Set it to a directory containing WABT toolkit'
    );
    return;
  }

  const engine = new Liquid({
    root: TEMPLATES_DIR,
  });

  const projectRoot = await findProjectRoot();
  const generatedDir = path.join(projectRoot, 'wasm/_generated');

  const modules = await glob('wasm/*.wasm', { cwd: projectRoot });
  const wasm2c = path.join(waToolkitPath, 'wasm2c');
  const pathToRuntimeHeader = path.join(ASSETS_DIR, 'wasm-rt-weak.h');

  const hostOutputDir = path.join(generatedDir, `@rn-wasm-host`);
  await fs.mkdir(hostOutputDir, { recursive: true });

  for (const mod of modules) {
    console.log('Processing WebAssembly module: ', chalk.bold(mod));
    const name = path.basename(mod, '.wasm');
    const fullInPath = path.join(projectRoot, mod);

    const libOutputDir = path.join(generatedDir, name);
    await fs.mkdir(libOutputDir, { recursive: true });

    const fullOutPath = path.join(libOutputDir, `${name}.c`);
    await execa(wasm2c, [fullInPath, '-o', fullOutPath]);
    await fs.copyFile(
      pathToRuntimeHeader,
      path.join(libOutputDir, 'wasm-rt.h')
    );

    const buildFile = await engine.renderFile('BUILD.bazel.liquid', {
      name,
    });
    await fs.writeFile(path.join(libOutputDir, 'BUILD'), buildFile);
    await fs.copyFile(
      path.join(ASSETS_DIR, 'Info.plist'),
      path.join(libOutputDir, 'Info.plist')
    );
  }
});

export default command;
