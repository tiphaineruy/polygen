import { HEADER } from '../common.js';
import { W2CModule } from '../../module.js';
import type {
  GeneratedFunctionExport,
  GeneratedMemoryExport,
} from '../../types.js';
import stripIndent from 'strip-indent';

export function buildExportBridgeHeader(module: W2CModule) {
  return `
    ${HEADER}
    #pragma once
    #include "jsi-imports-bridge.h"

    namespace facebook::react {

    jsi::Object create${module.generatedClassName}Exports(jsi::Runtime &rt, jsi::Object&& importObject);

    }
`;
}

export function buildExportBridgeSource(module: W2CModule) {
  function makeExportFunc(func: GeneratedFunctionExport) {
    const args = func.params.map((_, i) => `, args[${i}].asNumber()`).join('');
    const res = func.hasReturn ? 'auto res = ' : '';
    const returnPart = func.hasReturn
      ? 'return jsi::Value { (double)res };'
      : 'return jsi::Value::undefined()';

    return `
      /* export: '${func.name}' */
      exports.setProperty(rt, "${func.name}", HOSTFN("${func.name}", ${func.params.length}) {
        auto nativeState = get${module.contextClassName}Context(rt, thisValue);
        assert(nativeState != nullptr);
        ${res}${func.generatedFunctionName}(&nativeState->rootCtx${args});
        ${returnPart};
      }));
    `;
  }

  function makeExportMemory(mem: GeneratedMemoryExport) {
    return `
      /* exported memory: '${mem.name}' */
      {
        jsi::Object holder {rt};
        auto memory = std::make_shared<Memory>(${mem.mangledAccessorFunction}(&inst->rootCtx));
        holder.setNativeState(rt, std::move(memory));
        memories.setProperty(rt, "${mem.name}", std::move(holder));
      }
    `;
  }

  const initArgs = module.importedModules
    .map((mod) => `, &inst->${mod.generatedRootContextFieldName}`)
    .join('');

  return (
    HEADER +
    stripIndent(`
    #include <ReactNativeWebAssembly/gen-utils.h>
    #include <ReactNativeWebAssembly/Memory.h>
    #include "jsi-exports-bridge.h"
    #include "wasm-rt.h"

    namespace facebook::react {
      std::shared_ptr<${module.contextClassName}> get${module.contextClassName}Context(jsi::Runtime& rt, const jsi::Value& val) {
        auto obj = val.asObject(rt);
        assert(obj.hasNativeState(rt));
        auto ctx = std::dynamic_pointer_cast<${module.contextClassName}>(obj.getNativeState(rt));
        assert(ctx != nullptr);
        return ctx;
      }

      jsi::Object create${module.generatedClassName}Exports(jsi::Runtime &rt, jsi::Object&& importObject) {
        jsi::Object mod { rt };

        if (!wasm_rt_is_initialized()) {
          wasm_rt_init();
        }

        auto inst = std::make_shared<${module.contextClassName}>(rt, std::move(importObject));
        wasm2c_${module.mangledName}_instantiate(&inst->rootCtx${initArgs});

        mod.setNativeState(rt, inst);

        // Memories
        jsi::Object memories {rt};
        ${[...module.getGeneratedExportedMemories().map(makeExportMemory)].join('\n        ')}
        mod.setProperty(rt, "memories", std::move(memories));

        // Exported functions
        jsi::Object exports {rt};
        ${[...module.getGeneratedExportedFunctions().map(makeExportFunc)].join('\n        ')}
        exports.setNativeState(rt, inst);
        mod.setProperty(rt, "exports", std::move(exports));

        return std::move(mod);
      }
    }
  `)
  );
}
