#pragma once

#include <ReactCommon/TurboModule.h>
#include <RNWASMSpecJSI.h>

namespace facebook::react {

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


