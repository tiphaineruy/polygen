import { findUp } from 'find-up';
import path from 'path';
import { UnknownProjectError } from '../errors.js';

export async function findProjectRoot(
  from: string = process.cwd()
): Promise<string> {
  const packageJsonPath = await findUp('package.json', { cwd: from });

  if (!packageJsonPath) {
    throw new UnknownProjectError('Could not locate package.json');
  }

  return path.dirname(packageJsonPath);
}
