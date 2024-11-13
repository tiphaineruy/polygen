#pragma once

#include "Module.h"
#include <ReactCommon/TurboModule.h>
#include <RNWASMSpecJSI.h>

namespace facebook::react {

class ModuleNativeState: public jsi::NativeState {
public:
  explicit ModuleNativeState(std::unique_ptr<Module>&& module): module_(std::move(module)) {}
  
  const Module& getModule() const {
    return *module_;
  }
  
private:
  std::unique_ptr<Module> module_;
};

class ReactNativeWebAssembly : public NativeWebAssemblyCxxSpecJSI {
public:
  constexpr static auto kModuleName = "WebAssembly";

  explicit ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker);
  virtual ~ReactNativeWebAssembly();

  jsi::Object getModuleMetadata(jsi::Runtime &rt, jsi::Object moduleHolder) override;
  jsi::Object loadModule(jsi::Runtime &rt, jsi::String name) override;
  void unloadModule(jsi::Runtime &rt, jsi::Object lib) override;

  jsi::Object createModuleInstance(jsi::Runtime &rt, jsi::Object mod, jsi::Object importObject) override;
  void destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) override;
};

}


