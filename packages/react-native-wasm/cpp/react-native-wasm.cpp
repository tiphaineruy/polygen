#include <memory>
#include "react-native-wasm.h"
#include "module.h"
#include "wasm-rt/wasm-rt.h"
#include <ReactNativeWebAssemblyExample/example.h>

typedef void (*wasm_function_ptr)(void*);
typedef int (*wasm_fib)(void*, int);
//
//typedef struct w2c_example {
//  wasm_rt_memory_t w2c_memory;
//} w2c_example;

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
  wasm_rt_memory_t memory;
  
  wasm_rt_allocate_memory(&memory, 1, 1, false);
  
  auto init = library->get<wasm_function_ptr>("wasm2c_example_instantiate");
  auto free = library->get<wasm_function_ptr>("wasm2c_example_free");
  auto fib = library->get<wasm_fib>("w2c_example_fib");
  
  w2c_example inst {};
  inst.w2c_memory = memory;
  wasm2c_example_instantiate(&inst);
  auto res = w2c_example_fib(&inst, 15);
  wasm2c_example_free(&inst);
  
  return jsi::Object {rt};
}

void ReactNativeWebAssembly::destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) {
  instance.setNativeState(rt, nullptr);
}

}
