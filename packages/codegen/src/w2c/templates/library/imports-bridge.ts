import { HEADER } from '../common.js';
import { W2CModuleContext } from '../../context.js';
import type { GeneratedFunctionImport, GeneratedImport } from '../../types.js';
import stripIndent from 'strip-indent';

export function buildImportBridgeHeader(module: W2CModuleContext) {
  const imports = module.codegen.importedModules;
  const importsContextDeclarations = imports.map(
    (importInfo) =>
      `GEN_IMPORT_CONTEXT_TYPE(${importInfo.generatedContextTypeName}, ${module.codegen.generatedContextTypeName});`
  );

  return (
    HEADER +
    stripIndent(`
    #pragma once
    #include <jsi/jsi.h>
    #include <ReactNativePolygen/gen-utils.h>
    #include "${module.name}.h"

    ${importsContextDeclarations.join('\n    ')}

    namespace facebook::react {

    class ${module.turboModule.generatedClassName}ModuleContext: public jsi::NativeState {
    public:
      ${module.turboModule.generatedClassName}ModuleContext(jsi::Runtime& rt, jsi::Object&& importObject)
        : importObject(std::move(importObject))
        ${imports.map((i) => `, INIT_IMPORT_CTX(${i.generatedRootContextFieldName}, "${i.name}")`).join('\n        ')}
      {}

      jsi::Object importObject;
      ${module.codegen.generatedContextTypeName} rootCtx;
      ${imports.map((i) => `${i.generatedContextTypeName} ${i.generatedRootContextFieldName};`).join('\n      ')}
    };
    }
    `)
  );
}

export function buildImportBridgeSource(module: W2CModuleContext) {
  function makeImportFunc(func: GeneratedFunctionImport): string {
    const declarationParams = func.parameterTypeNames
      .map((name, i) => `, ${name} arg${i}`)
      .join(' ');

    const args = func.parameterTypeNames
      .map((_, i) => `, jsi::Value { (double)arg${i} }`)
      .join('');

    const returnKeyword = func.target.resultTypes.length > 0 ? 'return ' : '';
    const castSuffix = func.target.resultTypes.length > 0 ? '.asNumber()' : '';

    // TODO: get import info for this func as ctx 1st params
    return `
      /* import: '${func.module}' '${func.name}' */
      ${func.returnTypeName} ${func.generatedFunctionName}(${func.moduleInfo.generatedContextTypeName}* ctx${declarationParams}) {
        auto fn = ctx->importObj.getPropertyAsFunction(ctx->rt, "${func.name}");
        ${returnKeyword}fn.call(ctx->rt${args})${castSuffix};
      }
    `;
  }

  function makeImport(imp: GeneratedImport): string {
    switch (imp.target.kind) {
      case 'function':
        return makeImportFunc(imp as GeneratedFunctionImport);
      default:
        console.warn('Unknown import type', imp.target.kind);
        return '';
    }
  }

  return (
    HEADER +
    stripIndent(`
    #include "jsi-imports-bridge.h"

    using namespace facebook;

    #ifdef __cplusplus
    extern "C" {
    #endif

    ${module.codegen.imports.map((i) => makeImport(i)).join('\n    ')}

    #ifdef __cplusplus
    }
    #endif
  `)
  );
}
