#!/usr/bin/env node
import { Command } from 'commander';
import initCommand from '../commands/init.js';
import generateCommand from '../commands/generate.js';
import cleanCommand from '../commands/clean.js';

const program = new Command();

program
  .name('react-native-wasm')
  .description('Generates React Native Modules from Wasm');

program
  .configureHelp({ showGlobalOptions: true })
  .option('-v, --verbose', 'Output verbose');

program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(cleanCommand);

program.action(() => {
  program.help();
});

program.parse();
