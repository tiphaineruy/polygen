#!/usr/bin/env node
import { Command } from 'commander';
import { oraPromise } from 'ora';
import fs from 'node:fs/promises';
import path from 'node:path';
import { findProjectRoot } from '../api/project.js';
import chalk from 'chalk';
import consola from 'consola';

const command = new Command('clean')
  .description('Cleans all WASM generated output files')
  .option('-y, --yes', 'Remove files without confirmation');

command.action(async (options) => {
  const projectRoot = await findProjectRoot();
  const generatedPath = path.join(projectRoot, 'wasm/_generated');

  let confirmed = options.yes;

  if (!confirmed) {
    confirmed = await consola.prompt(
      `Remove directory ${chalk.bold(generatedPath)}?`,
      {
        type: 'confirm',
      }
    );
  }

  if (!confirmed) {
    console.info('Clean canceled');
    return;
  }

  await oraPromise(
    fs.rm(generatedPath, { recursive: true }),
    `Removing ${chalk.bold('wasm/_generated')}`
  );

  consola.success('Generated files removed!');
});

export default command;
