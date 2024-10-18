#include "react-native-wasm.h"
#include <memory>
#include <dlfcn.h>
#include "wasm-rt/wasm-rt.h"

typedef void (*wasm_function_ptr)(void*);
typedef int (*wasm_fib)(void*, int);

namespace facebook::react {

SharedLibraryNativeState::SharedLibraryNativeState(void* handle): ptr_(handle) {}

SharedLibraryNativeState::~SharedLibraryNativeState() {
  dlclose(this->ptr_);
  this->ptr_ = nullptr;
}

SharedLibraryNativeState SharedLibraryNativeState::load(const char* name, int mode) {
  SharedLibraryNativeState state{ dlopen(name, mode) };
  return state;
}

jsi::Object ReactNativeWebAssembly::getModuleMetadata(jsi::Runtime &rt, jsi::String name) {
  return jsi::Object {rt};
}

jsi::Object ReactNativeWebAssembly::loadModule(jsi::Runtime &rt, jsi::String name) {
  auto library = std::make_shared<SharedLibraryNativeState>("libwasmexample.dylib", RTLD_LAZY);
  
  jsi::Object holder {rt};
  holder.setNativeState(rt, library);
  return holder;
}

void ReactNativeWebAssembly::unloadModule(jsi::Runtime &rt, jsi::Object lib) {
  lib.setNativeState(rt, nullptr);
}

jsi::Object ReactNativeWebAssembly::instantiateModule(jsi::Runtime &rt, jsi::String name, jsi::Object importObject) {
  wasm_rt_init();
  wasm_rt_memory_t memory;

  wasm_rt_allocate_memory(&memory, 1, 1, false);
//  
//  auto init = (wasm_function_ptr)dlsym(lib, "wasm2c_example_instantiate");
//  auto free = (wasm_function_ptr)dlsym(lib, "wasm2c_example_free");
//  auto fib = (wasm_fib)dlsym(lib, "w2c_example_fib");

  init();
  fib();
  free();

  wasm_rt_free();

  return jsi::Object {rt};
}

}
