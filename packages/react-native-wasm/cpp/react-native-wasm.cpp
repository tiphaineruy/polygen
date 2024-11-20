#include <memory>
#include "bridge.h"
#include "react-native-wasm.h"


namespace facebook::react {

ReactNativeWebAssembly::ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker)
: NativeWebAssemblyCxxSpecJSI(std::move(jsInvoker)) {
  wasm_rt_init();
}

ReactNativeWebAssembly::~ReactNativeWebAssembly() {
  wasm_rt_free();
}

const Module& tryGetModule(jsi::Runtime& rt, const jsi::Object& holder) {
  auto moduleWrapper = std::dynamic_pointer_cast<ModuleNativeState>(holder.getNativeState(rt));
  if (moduleWrapper == nullptr) {
    throw new jsi::JSError(rt, "Argument passed is not a valid loaded module or it was unloaded (missing native state)");
  }

  return moduleWrapper->getModule();
}

const Memory& tryGetMemory(jsi::Runtime& rt, const jsi::Object& holder) {
  auto memoryWrapper = std::dynamic_pointer_cast<MemoryNativeState>(holder.getNativeState(rt));
  if (memoryWrapper == nullptr) {
    throw new jsi::JSError(rt, "Argument passed is not a valid WebAssembly memory");
  }

  return memoryWrapper->getMemory();
}

std::shared_ptr<MemoryNativeState> tryGetMemoryNativeState(jsi::Runtime& rt, const jsi::Object& holder) {
  auto memoryWrapper = std::dynamic_pointer_cast<MemoryNativeState>(holder.getNativeState(rt));
  if (memoryWrapper == nullptr) {
    throw new jsi::JSError(rt, "Argument passed is not a valid WebAssembly memory");
  }

  return memoryWrapper;
}


jsi::Object ReactNativeWebAssembly::loadModule(jsi::Runtime &rt, jsi::String name) {
  auto mod = loadWebAssemblyModule(std::move(name.utf8(rt)));
  auto moduleWrapper = std::make_shared<ModuleNativeState>(std::move(mod));

  jsi::Object holder {rt};
  holder.setNativeState(rt, moduleWrapper);
  return holder;
}

void ReactNativeWebAssembly::unloadModule(jsi::Runtime &rt, jsi::Object module) {
  module.setNativeState(rt, nullptr);
}

jsi::Object ReactNativeWebAssembly::getModuleMetadata(jsi::Runtime &rt, jsi::Object moduleHolder) {
  auto& mod = tryGetModule(rt, moduleHolder);
  auto imports = mod.getImports();
  auto exports = mod.getExports();

  auto resultObj = jsi::Object {rt};
  auto importsArray = jsi::Array {rt, imports.size()};
  auto exportsArray = jsi::Array {rt, exports.size()};

  auto index = 0;
  for (auto& import_ : imports) {
    auto importObj = jsi::Object {rt};
    importObj.setProperty(rt, "module", import_.module);
    importObj.setProperty(rt, "name", import_.name);
    importObj.setProperty(rt, "kind", "function");
    importsArray.setValueAtIndex(rt, index++, importObj);
  }

  index = 0;
  for (auto& export_ : exports) {
    auto exportObj = jsi::Object {rt};
    exportObj.setProperty(rt, "name", export_.name);
    exportObj.setProperty(rt, "kind", "function");
    exportsArray.setValueAtIndex(rt, index++, exportObj);
  }

  resultObj.setProperty(rt, "imports", std::move(importsArray));
  resultObj.setProperty(rt, "exports", std::move(exportsArray));
  return resultObj;
}

jsi::Object ReactNativeWebAssembly::createModuleInstance(jsi::Runtime &rt, jsi::Object moduleHolder, jsi::Object importObject) {
  auto& mod = tryGetModule(rt, moduleHolder);

//  auto init = library->get<wasm_function_ptr>("wasm2c_example_instantiate");
//  auto free = library->get<wasm_function_ptr>("wasm2c_example_free");
//  auto fib = library->get<wasm_fib>("w2c_example_fib");


  return mod.createInstance(rt, std::move(importObject));
}

void ReactNativeWebAssembly::destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) {
  instance.setNativeState(rt, nullptr);
}

jsi::Object ReactNativeWebAssembly::createMemory(jsi::Runtime &rt, double initial, std::optional<double> maximum) {
  auto maxPages = (uint64_t)maximum.value_or(100);
  auto memory = std::make_unique<Memory>((uint64_t)initial, maxPages, false);

  jsi::Object holder {rt};
  holder.setNativeState(rt, std::make_shared<MemoryNativeState>(std::move(memory)));
  return rt;
}

jsi::Object ReactNativeWebAssembly::getMemoryBuffer(jsi::Runtime &rt, jsi::Object instance) {
  auto memoryState = tryGetMemoryNativeState(rt, instance);

  jsi::ArrayBuffer buffer {rt, memoryState};
  return buffer;
}

void ReactNativeWebAssembly::growMemory(jsi::Runtime &rt, jsi::Object instance, double delta) {
  auto& memory = tryGetMemory(rt, instance);
  memory.grow((uint64_t)delta);
}

}
