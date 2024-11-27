import { HEADER } from '../common.js';
import { W2CModule } from '../../module.js';
import type { GeneratedFunctionImport } from '../../types.js';
import stripIndent from 'strip-indent';

export function buildImportBridgeHeader(module: W2CModule) {
  const imports = module.importedModules;
  const importsContextDeclarations = imports.map(
    (importInfo) =>
      `GEN_IMPORT_CONTEXT_TYPE(${importInfo.generatedContextTypeName}, ${module.generatedContextTypeName});`
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

    class ${module.generatedClassName}ModuleContext: public jsi::NativeState {
    public:
      ${module.generatedClassName}ModuleContext(jsi::Runtime& rt, jsi::Object&& importObject)
        : importObject(std::move(importObject))
        ${imports.map((i) => `, INIT_IMPORT_CTX(${i.generatedRootContextFieldName}, "${i.name}")`).join('\n        ')}
      {}

      jsi::Object importObject;
      ${module.generatedContextTypeName} rootCtx;
      ${imports.map((i) => `${i.generatedContextTypeName} ${i.generatedRootContextFieldName};`).join('\n      ')}
    };
    }
    `)
  );
}

export function buildImportBridgeSource(module: W2CModule) {
  function makeImportFunc(func: GeneratedFunctionImport) {
    const declarationParams = func.parameterTypeNames
      .map((name, i) => `, ${name} arg${i}`)
      .join(' ');

    const args = func.params
      .map((_, i) => `, jsi::Value { (double)arg${i} }`)
      .join('');

    const returnKeyword = func.hasReturn ? 'return ' : '';
    const castSuffix = func.hasReturn ? '.asNumber()' : '';

    // TODO: get import info for this func as ctx 1st params
    return `
      /* import: '${func.module}' '${func.name}' */
      ${func.returnTypeName} ${func.generatedFunctionName}(${func.moduleInfo.generatedContextTypeName}* ctx${declarationParams}) {
        auto fn = ctx->importObj.getPropertyAsFunction(ctx->rt, "${func.name}");
        ${returnKeyword}fn.call(ctx->rt${args})${castSuffix};
      }
    `;
  }

  return (
    HEADER +
    stripIndent(`
    #include "jsi-imports-bridge.h"

    using namespace facebook;

    #ifdef __cplusplus
    extern "C" {
    #endif

    ${module.generatedImports.map((i) => makeImportFunc(i)).join('\n    ')}

    #ifdef __cplusplus
    }
    #endif
  `)
  );
}
