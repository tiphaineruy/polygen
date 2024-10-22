#include "react-native-wasm.h"
#include <memory>
#include <dlfcn.h>
#include "wasm-rt/wasm-rt.h"
#include <ReactNativeWASMExample/example.h>

typedef void (*wasm_function_ptr)(void*);
typedef int (*wasm_fib)(void*, int);

namespace facebook::react {

SharedLibraryNativeState::SharedLibraryNativeState(void* handle): ptr_(handle) {}

SharedLibraryNativeState::~SharedLibraryNativeState() {
  dlclose(this->ptr_);
  this->ptr_ = nullptr;
}

SharedLibraryNativeState SharedLibraryNativeState::load(const char* name, int mode) {
  return SharedLibraryNativeState { dlopen(name, mode) };
}

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
  auto library = std::make_shared<SharedLibraryNativeState>(SharedLibraryNativeState::load("libwasmexample.dylib", RTLD_LAZY));
  
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
  init(&inst);
  auto res = fib(&inst, 5);
  free(&inst);

  return jsi::Object {rt};
}

void ReactNativeWebAssembly::destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) {
  instance.setNativeState(rt, nullptr);
}

}
