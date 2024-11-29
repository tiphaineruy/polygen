import type { ConfigT } from 'metro-config';
import type { CustomResolver } from 'metro-resolver';
import path from 'node:path';
import fs from 'node:fs';
import { Project } from '@callstack/polygen-core-build';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function getPolygenMetroConfig(): DeepPartial<ConfigT> {
  const project = Project.findClosestSync();

  const resolveRequest: CustomResolver = (context, moduleName, platform) => {
    if (moduleName.endsWith('.wasm')) {
      const cleanName = path.basename(moduleName, '.wasm');
      const callerDir = path.normalize(path.dirname(context.originModulePath));

      const pathInSource = project.globalPathToLocal(
        callerDir,
        project.localSourceDir
      );
      const mockModulePath = project.pathToOutput(
        'modules',
        pathInSource,
        cleanName + '.js'
      );

      if (!fs.existsSync(mockModulePath)) {
        throw new Error(
          `Attempting to import unknown WASM module '${moduleName}' from ${context.originModulePath}.\n Did you forget to run \`polygen generate\`?`
        );
      }

      return { type: 'sourceFile', filePath: mockModulePath };
    }

    return context.resolveRequest(context!, moduleName, platform);
  };

  return {
    resolver: {
      resolveRequest,
    },
  };
}
