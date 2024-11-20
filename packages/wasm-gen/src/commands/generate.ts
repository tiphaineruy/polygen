#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import consola from 'consola';
import { glob } from 'glob';
import { oraPromise } from 'ora';
import chalk from 'chalk';
import path from 'path';
import { findProjectRoot } from '../api/project.js';
import { WasmModule } from '../webassembly/module.js';
import { W2CGenerator } from '../w2c/generator.js';
import { W2CModule } from '../w2c/module.js';

const command = new Command('generate').description(
  'Generates React Native Modules from Wasm'
);

const ROOT_DIR = path.join(fileURLToPath(import.meta.url), '../../..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');

command.action(async () => {
  const projectRoot = await findProjectRoot();
  const generatedDir = path.join(projectRoot, 'wasm/_generated');

  const w2cGenerator = new W2CGenerator({
    assetsDirectory: ASSETS_DIR,
    templateDirectory: TEMPLATES_DIR,
    outputDirectory: generatedDir,
    singleProject: true,
  });

  const modules = await glob('wasm/*.wasm', { cwd: projectRoot });
  // const pathToRuntimeHeader = path.join(ASSETS_DIR, 'wasm-rt-weak.h');

  consola.info('Found', chalk.bold(modules.length), 'WebAssembly module(s)');
  const generatedModules: W2CModule[] = [];

  for (const mod of modules) {
    // const fullInPath = path.join(projectRoot, mod);

    // const libOutputDir = path.join(generatedDir, name);
    // await fs.mkdir(libOutputDir, { recursive: true });

    // const fullOutPath = path.join(libOutputDir, `${name}.c`);
    // await fs.copyFile(
    //   pathToRuntimeHeader,
    //   path.join(libOutputDir, 'wasm-rt.h')
    // );

    const parsedModule = await oraPromise(
      WasmModule.fromWASM(mod),
      `Loading ${chalk.bold(mod)} metadata`
    );

    await oraPromise(
      async () => {
        const result = await w2cGenerator.generateModule(parsedModule);
        generatedModules.push(result);
        return result;
      },
      `Processing ${chalk.bold(mod)} module`
    );

    // const memoriesCount = [...generatedModule.getImportedFunctions()].length;
    // const functionCount = [...generatedModule.getExportedFunctions()].length;
    // consola.info(`Found ${chalk.bold()}`)

    // const buildFile = await engine.renderFile('BUILD.bazel.liquid', {
    //   name,
    // });
    // await fs.writeFile(path.join(libOutputDir, 'BUILD'), buildFile);
    // await fs.copyFile(
    //   path.join(ASSETS_DIR, 'Info.plist'),
    //   path.join(libOutputDir, 'Info.plist')
    // );
  }

  await w2cGenerator.generateHostModule(generatedModules);
});

export default command;
