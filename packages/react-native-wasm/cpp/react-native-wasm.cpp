#include <memory>
#include "bridge.h"
#include "react-native-wasm.h"
#include "wasm-rt/wasm-rt.h"


namespace facebook::react {

ReactNativeWebAssembly::ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker)
: NativeWebAssemblyCxxSpecJSI(std::move(jsInvoker)) {
  wasm_rt_init();
}

ReactNativeWebAssembly::~ReactNativeWebAssembly() {
  wasm_rt_free();
}

jsi::Object ReactNativeWebAssembly::getModuleMetadata(jsi::Runtime &rt, jsi::Object moduleHolder) {
  auto moduleWrapper = std::dynamic_pointer_cast<ModuleNativeState>(moduleHolder.getNativeState(rt));
  if (moduleWrapper == nullptr) {
    throw new jsi::JSError(rt, "Argument passed to createModuleInstance is not a loaded module or it was unloaded (missing native state)");
  }
  
  auto imports = moduleWrapper->getModule().getImports();
  auto exports = moduleWrapper->getModule().getExports();
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
  resultObj.setProperty(rt, "exports ", std::move(exportsArray));
  return resultObj;
}

jsi::Object ReactNativeWebAssembly::loadModule(jsi::Runtime &rt, jsi::String name) {
  auto&& mod = loadWebAssemblyModule(std::move(name.utf8(rt)));
  auto moduleWrapper = std::make_shared<ModuleNativeState>(std::move(mod));
  
  jsi::Object holder {rt};
  holder.setNativeState(rt, moduleWrapper);
  return holder;
}

void ReactNativeWebAssembly::unloadModule(jsi::Runtime &rt, jsi::Object module) {
  module.setNativeState(rt, nullptr);
}

jsi::Object ReactNativeWebAssembly::createModuleInstance(jsi::Runtime &rt, jsi::Object module, jsi::Object importObject) {
  auto moduleWrapper = std::dynamic_pointer_cast<ModuleNativeState>(module.getNativeState(rt));
  if (moduleWrapper == nullptr) {
    throw new jsi::JSError(rt, "Argument passed to createModuleInstance is not a loaded module or it was unloaded (missing native state)");
  }

//  auto init = library->get<wasm_function_ptr>("wasm2c_example_instantiate");
//  auto free = library->get<wasm_function_ptr>("wasm2c_example_free");
//  auto fib = library->get<wasm_fib>("w2c_example_fib");

  
  return moduleWrapper->getModule().createInstance(rt, std::move(importObject));
}

void ReactNativeWebAssembly::destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) {
  instance.setNativeState(rt, nullptr);
}

}
