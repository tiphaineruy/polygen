#!/usr/bin/env node
import { program } from 'commander';

program
  .name('wasm-gen-generate')
  .description('Generates React Native Modules from Wasm')
  .requiredOption('-o, --output <output-dir>', 'Path to output directory')
  .argument('<string>', 'Path to WASM module');

program.action((a, options) => {
  console.log(a,b,c);
});

program.parse(process.argv);
