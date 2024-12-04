#!/usr/bin/env node
import { Command, Option } from 'commander';
import consola from 'consola';
import { oraPromise } from 'ora';
import chalk from 'chalk';
import { Project } from '@callstack/polygen-core-build';
import {
  type AnySymbol,
  generateWasmJSModule,
  loadWasmModuleFromFile,
  SymbolSet,
} from '@callstack/polygen-codegen';
import { W2CGenerator, W2CModule } from '@callstack/polygen-codegen/w2c';

const command = new Command('generate')
  .description('Generates React Native Modules from Wasm')
  .addOption(
    new Option('-o, --output-dir <outputDir>', 'Path to output directory')
  )
  .addOption(new Option('-f, --force', 'Generate code even if not outdated'))
  .addOption(
    new Option(
      '--force-number-coercion',
      'Force number coercion in module exports'
    )
  );
interface Options {
  outputDir?: string;
  force?: boolean;
  forceNumberCoercion?: boolean;
}

command.action(async (options: Options) => {
  const project = await Project.findClosest();
  if (options.outputDir) {
    consola.info(`Using ${chalk.dim(options.outputDir)} as output directory`);
    project.updateOptionsInMemory({ outputDirectory: options.outputDir });
  }

  const w2cGenerator = new W2CGenerator({
    outputDirectory: project.fullOutputDirectory,
    singleProject: true,
    generateMetadata: true,
    forceGenerate: options.force ?? false,
    hackAutoNumberCoerce: options.forceNumberCoercion ?? false,
  });

  const modules = await project.getWebAssemblyModules();
  // const pathToRuntimeHeader = path.join(ASSETS_DIR, 'wasm-rt-weak.h');

  consola.info('Found', chalk.bold(modules.length), 'WebAssembly module(s)');
  const generatedModules: W2CModule[] = [];

  for (const mod of modules) {
    const modPath = project.pathToSource(mod);
    const parsedModule = await oraPromise(
      loadWasmModuleFromFile(modPath),
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

    await generateWasmJSModule(project, `src/${mod}`);

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
