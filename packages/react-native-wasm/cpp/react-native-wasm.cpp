#include <memory>
#include "bridge.h"
#include "react-native-wasm.h"
#include "Global.h"
#include "Memory.h"
#include "Module.h"
#include "NativeStateHelper.h"


namespace facebook::react {

ReactNativeWebAssembly::ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker)
: NativeWebAssemblyCxxSpecJSI(std::move(jsInvoker)) {
  wasm_rt_init();
}

ReactNativeWebAssembly::~ReactNativeWebAssembly() {
  wasm_rt_free();
}


jsi::Object ReactNativeWebAssembly::loadModule(jsi::Runtime &rt, jsi::String name) {
  auto mod = loadWebAssemblyModule(std::move(name.utf8(rt)));

  return NativeStateHelper::wrap(rt, mod);
}

void ReactNativeWebAssembly::unloadModule(jsi::Runtime &rt, jsi::Object module) {
  module.setNativeState(rt, nullptr);
}

jsi::Object ReactNativeWebAssembly::getModuleMetadata(jsi::Runtime &rt, jsi::Object moduleHolder) {
  auto mod = NativeStateHelper::tryGet<Module>(rt, moduleHolder);
  auto imports = mod->getImports();
  auto exports = mod->getExports();

  auto resultObj = jsi::Object {rt};
  auto importsArray = jsi::Array {rt, imports.size()};
  auto exportsArray = jsi::Array {rt, exports.size()};

  auto index = 0;
  for (auto& import_ : imports) {
//    Bridging<NativeWebAssemblyModuleImportDescriptor<std::string, std::string, std::string>>;
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
  auto mod = NativeStateHelper::tryGet<Module>(rt, moduleHolder);

//  auto init = library->get<wasm_function_ptr>("wasm2c_example_instantiate");
//  auto free = library->get<wasm_function_ptr>("wasm2c_example_free");
//  auto fib = library->get<wasm_fib>("w2c_example_fib");

  return mod->createInstance(rt, std::move(importObject));
}

void ReactNativeWebAssembly::destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) {
  instance.setNativeState(rt, nullptr);
}


// Memories
jsi::Object ReactNativeWebAssembly::createMemory(jsi::Runtime &rt, double initial, std::optional<double> maximum) {
  auto maxPages = (uint64_t)maximum.value_or(100);
  auto memory = std::make_shared<Memory>((uint64_t)initial, maxPages, false);

  return NativeStateHelper::wrap(rt, memory);
}

jsi::Object ReactNativeWebAssembly::getMemoryBuffer(jsi::Runtime &rt, jsi::Object instance) {
  auto memoryState = NativeStateHelper::tryGet<Memory>(rt, instance);

  jsi::ArrayBuffer buffer {rt, memoryState};
  return buffer;
}

void ReactNativeWebAssembly::growMemory(jsi::Runtime &rt, jsi::Object instance, double delta) {
  auto memory = NativeStateHelper::tryGet<Memory>(rt, instance);
  memory->grow((uint64_t)delta);
}


// Globals
jsi::Object ReactNativeWebAssembly::createGlobal(jsi::Runtime &rt, jsi::Value rawType, bool isMutable, double initialValue) {
  auto type = Bridging<NativeWebAssemblyNativeType>::fromJs(rt, rawType);
  auto waType = static_cast<Global::Type>((uint32_t)type);
  jsi::Value initial { initialValue };
  auto globalVar = std::make_shared<Global>(waType, std::move(initial), isMutable);

  return NativeStateHelper::wrap(rt, globalVar);
  
}

double ReactNativeWebAssembly::getGlobalValue(jsi::Runtime &rt, jsi::Object instance) {
  auto globalVar = NativeStateHelper::tryGet<Global>(rt, instance);
  
  return globalVar->getValue().asNumber();
}

void ReactNativeWebAssembly::setGlobalValue(jsi::Runtime &rt, jsi::Object instance, double newValue) {
  auto globalVar = NativeStateHelper::tryGet<Global>(rt, instance);
  
  globalVar->setValue(rt, {newValue});
}

}
