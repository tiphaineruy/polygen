#pragma once

#include <ReactCommon/TurboModule.h>
#include <RNWASMSpecJSI.h>

namespace facebook::react {

class ReactNativeWebAssembly : public NativeWebAssemblyCxxSpecJSI {
public:
  constexpr static auto kModuleName = "WebAssembly";

  explicit ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker);
  virtual ~ReactNativeWebAssembly();

  jsi::Object loadModule(jsi::Runtime &rt, jsi::Object moduleData) override;
  void unloadModule(jsi::Runtime &rt, jsi::Object lib) override;
  jsi::Object getModuleMetadata(jsi::Runtime &rt, jsi::Object moduleHolder) override;

  jsi::Object createModuleInstance(jsi::Runtime &rt, jsi::Object moduleHolder, jsi::Object importObject) override;
  void destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) override;

  // Memory
  jsi::Object createMemory(jsi::Runtime &rt, double initial, std::optional<double> maximum) override;
  jsi::Object getMemoryBuffer(jsi::Runtime &rt, jsi::Object instance) override;
  void growMemory(jsi::Runtime &rt, jsi::Object instance, double delta) override;

  // Globals
  jsi::Object createGlobal(jsi::Runtime &rt, jsi::Value type, bool isMutable, double initialValue) override;
  double getGlobalValue(jsi::Runtime &rt, jsi::Object instance) override;
  void setGlobalValue(jsi::Runtime &rt, jsi::Object instance, double newValue) override;
};

}


