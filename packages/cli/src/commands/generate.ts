#!/usr/bin/env node
import { Command } from 'commander';
import consola from 'consola';
import { glob } from 'glob';
import { oraPromise } from 'ora';
import chalk from 'chalk';
import path from 'path';
import { findProjectRoot } from '../api/project.js';
import {
  type AnySymbol,
  loadWasmModuleFromFile,
  SymbolSet,
} from '@callstack/polygen-codegen';
import { W2CGenerator, W2CModule } from '@callstack/polygen-codegen/w2c';

const command = new Command('generate').description(
  'Generates React Native Modules from Wasm'
);

command.action(async () => {
  const projectRoot = await findProjectRoot();
  const generatedDir = path.join(projectRoot, 'wasm/_generated');

  const w2cGenerator = new W2CGenerator({
    outputDirectory: generatedDir,
    singleProject: true,
    generateMetadata: true,
    forceGenerate: true,
  });

  const modules = await glob('wasm/*.wasm', { cwd: projectRoot });
  // const pathToRuntimeHeader = path.join(ASSETS_DIR, 'wasm-rt-weak.h');

  consola.info('Found', chalk.bold(modules.length), 'WebAssembly module(s)');
  const generatedModules: W2CModule[] = [];

  for (const mod of modules) {
    const parsedModule = await oraPromise(
      loadWasmModuleFromFile(mod),
      `Loading ${chalk.magenta(mod)} metadata`
    );

    const generatedModule = await oraPromise(
      async () => {
        const result = await w2cGenerator.generateModule(parsedModule);
        generatedModules.push(result);
        return result;
      },
      `Processing ${chalk.magenta(mod)} module`
    );

    const imports = generatedModule.imports;
    const exports = generatedModule.exports;
    const hglt = chalk.dim;

    function statsOf<T extends AnySymbol<TKey>, TKey = T['type']>(
      set: SymbolSet<AnySymbol<TKey>>
    ): string {
      const highlight = chalk.dim;
      const countOf = (type: TKey) => set.byType.get(type)?.size ?? 0;
      return [
        `${highlight(countOf('Function' as TKey))} functions`,
        `${highlight(countOf('Memory' as TKey))} memories`,
      ].join(', ');
    }

    consola.info(`  Found ${hglt(imports.size)} imports (${statsOf(imports)})`);
    consola.info(`  Found ${hglt(exports.size)} exports (${statsOf(exports)})`);

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
