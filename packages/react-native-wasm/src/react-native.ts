import { makeModuleName } from './internal';

/**
 * Allows to reference a module by its name.
 *
 * @param name
 */
export function moduleRef(name: string): ArrayBuffer {
  return makeModuleName(name);
}
