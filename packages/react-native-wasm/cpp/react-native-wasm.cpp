#include <memory>
#include "react-native-wasm.h"
#include "module.h"
#include "wasm-rt/wasm-rt.h"
#include "ReactNativeWebAssemblyHost/mediator.h"


namespace facebook::react {

ReactNativeWebAssembly::ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker)
: NativeWebAssemblyCxxSpecJSI(std::move(jsInvoker)) {
  wasm_rt_init();
}

ReactNativeWebAssembly::~ReactNativeWebAssembly() {
  wasm_rt_free();
}

jsi::Object ReactNativeWebAssembly::getModuleMetadata(jsi::Runtime &rt, jsi::String name) {
  return jsi::Object {rt};
}

jsi::Object ReactNativeWebAssembly::loadModule(jsi::Runtime &rt, jsi::String name) {
  // TODO: remove hardcoded name, use parameter
  auto library = std::make_shared<SharedLibraryNativeState>(SharedLibraryNativeState::load("rn_wasmlib_example", RTLD_LAZY));
  
  jsi::Object holder {rt};
  holder.setNativeState(rt, library);
  return holder;
}

void ReactNativeWebAssembly::unloadModule(jsi::Runtime &rt, jsi::Object lib) {
  lib.setNativeState(rt, nullptr);
}

jsi::Object ReactNativeWebAssembly::createModuleInstance(jsi::Runtime &rt, jsi::Object module, jsi::Object importObject) {
  auto library = std::dynamic_pointer_cast<SharedLibraryNativeState>(module.getNativeState(rt));
//  
//  auto init = library->get<wasm_function_ptr>("wasm2c_example_instantiate");
//  auto free = library->get<wasm_function_ptr>("wasm2c_example_free");
//  auto fib = library->get<wasm_fib>("w2c_example_fib");
  
  return createWebAssemblyModule(rt, "example", std::move(importObject));
}

void ReactNativeWebAssembly::destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) {
  instance.setNativeState(rt, nullptr);
}

}
