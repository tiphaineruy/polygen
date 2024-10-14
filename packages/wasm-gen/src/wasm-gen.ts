#!/usr/bin/env node
import { program } from 'commander';

program
  .name('wasm-gen')
  .description('Generates React Native Modules from Wasm');

program.command('doctor', 'Validate your environment');
program.command('generate', 'Generate TurboModule from WASM module');

program.action(() => {
  program.help();
});

program.parse(process.argv);
