#pragma once

#include <ReactCommon/TurboModule.h>
#include <dlfcn.h>
#include <RNWASMSpecJSI.h>

namespace facebook::react {

class SharedLibraryNativeState : public jsi::NativeState {
public:
  explicit SharedLibraryNativeState(void* handle);
  ~SharedLibraryNativeState();

  SharedLibraryNativeState(SharedLibraryNativeState&& other) = default;
  SharedLibraryNativeState& operator=(SharedLibraryNativeState&& other) = default;

  SharedLibraryNativeState(const SharedLibraryNativeState& other) = delete;
  SharedLibraryNativeState& operator=(const SharedLibraryNativeState& other) = delete;

  template <typename T>
  T get(const char* name) {
    return (T)dlsym(ptr_, name);
  }

  static SharedLibraryNativeState load(const char* name, int mode);

private:
  void* ptr_;
};

class ReactNativeWebAssembly : public NativeWebAssemblyCxxSpecJSI {
public:
  constexpr static auto kModuleName = "WebAssembly";

  explicit ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker);
  virtual ~ReactNativeWebAssembly();

  jsi::Object getModuleMetadata(jsi::Runtime &rt, jsi::String name) override;
  jsi::Object loadModule(jsi::Runtime &rt, jsi::String name) override;
  void unloadModule(jsi::Runtime &rt, jsi::Object lib) override;

  jsi::Object createModuleInstance(jsi::Runtime &rt, jsi::Object mod, jsi::Object importObject) override;
  void destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) override;
};

}


