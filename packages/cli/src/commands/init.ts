#!/usr/bin/env node
import { Command } from 'commander';
import { oraPromise } from 'ora';
import fs from 'node:fs/promises';
import path from 'node:path';
import { findProjectRoot } from '../api/project.js';
import chalk from 'chalk';

const command = new Command('init').description(
  'Initializes React Native WebAssembly in current directory'
);

const BAZEL_MODULE = `
module(
    name = "react_native_wasm_libs",
    compatibility_level = 1,
)

# Rules
bazel_dep(name = "rules_cc", version = "0.0.10")
bazel_dep(name = "rules_apple", version = "3.9.2")
`;

const WASM_GIT_IGNORE = `
.build
_generated/bazel-*
`;

async function makeProjectDirectory(
  projectRoot: string,
  directory: string
): Promise<void> {
  await oraPromise(
    fs.mkdir(path.join(projectRoot, directory), { recursive: true }),
    `Creating directory ${chalk.bold(directory)}`
  );
}

command.action(async () => {
  const projectRoot = await findProjectRoot();

  await oraPromise(
    fs.writeFile(path.join(projectRoot, `wasm/.gitignore`), WASM_GIT_IGNORE, {
      encoding: 'utf8',
    }),
    `Creating ${chalk.bold('wasm/.gitignore')}`
  );

  await makeProjectDirectory(projectRoot, 'wasm/_generated');
  await makeProjectDirectory(projectRoot, 'wasm/.build');
  const generatedDir = path.join(projectRoot, 'wasm/_generated');

  await oraPromise(
    fs.writeFile(path.join(generatedDir, `MODULE.bazel`), BAZEL_MODULE, {
      encoding: 'utf8',
    }),
    `Creating ${chalk.bold('wasm/_generated/MODULE.bazel')}`
  );
});

export default command;
