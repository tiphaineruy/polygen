import findUp from 'find-up';
import path from 'path';
import consola from 'consola';
import { UnknownProjectError } from '../errors.js';

/**
 * Finds project root that contains a `package.json`.
 *
 * @param from
 */
export async function findProjectRoot(
  from: string = process.cwd()
): Promise<string> {
  const packageJsonPath = await findUp('package.json', { cwd: from });

  if (!packageJsonPath) {
    throw new UnknownProjectError('Could not locate package.json');
  }

  const projectRoot = path.dirname(packageJsonPath);
  consola.verbose('Found project directory: ', projectRoot);

  return projectRoot;
}
