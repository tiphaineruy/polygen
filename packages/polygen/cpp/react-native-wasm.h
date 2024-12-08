#pragma once

#include <ReactCommon/TurboModule.h>
#include <RNWASMSpecJSI.h>

namespace facebook::react {

using NativeTableElementType = NativeWebAssemblyNativeTableElementType;
using NativeTableDescriptor = NativeWebAssemblyNativeTableDescriptor<
  /* initialSize */ double,
  /* maxSize */ std::optional<double>,
  /* element */ NativeTableElementType
>;

using NativeTableDescriptorBridging = NativeWebAssemblyNativeTableDescriptorBridging<NativeTableDescriptor>;

class ReactNativeWebAssembly : public NativeWebAssemblyCxxSpecJSI {
public:
  constexpr static auto kModuleName = "WebAssembly";

  explicit ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker);
  virtual ~ReactNativeWebAssembly();

  // Modules
  jsi::Object loadModule(jsi::Runtime &rt, jsi::Object moduleData) override;
  void unloadModule(jsi::Runtime &rt, jsi::Object lib) override;
  jsi::Object getModuleMetadata(jsi::Runtime &rt, jsi::Object moduleHolder) override;

  jsi::Object createModuleInstance(jsi::Runtime &rt, jsi::Object moduleHolder, jsi::Object importObject) override;
  void destroyModuleInstance(jsi::Runtime &rt, jsi::Object instance) override;

  // Memories
  void createMemory(jsi::Runtime &rt, jsi::Object holder, double initial, std::optional<double> maximum) override;
  jsi::Object getMemoryBuffer(jsi::Runtime &rt, jsi::Object instance) override;
  void growMemory(jsi::Runtime &rt, jsi::Object instance, double delta) override;

  // Globals
  void createGlobal(jsi::Runtime &rt, jsi::Object holder, jsi::Value type, bool isMutable, double initialValue) override;
  double getGlobalValue(jsi::Runtime &rt, jsi::Object instance) override;
  void setGlobalValue(jsi::Runtime &rt, jsi::Object instance, double newValue) override;

  // Tables
  void createTable(jsi::Runtime &rt, jsi::Object holder, jsi::Object tableDescriptor) override;
  void growTable(jsi::Runtime &rt, jsi::Object instance, double delta) override;
  jsi::Object getTableElement(jsi::Runtime &rt, jsi::Object instance, double index) override;
  void setTableElement(jsi::Runtime &rt, jsi::Object instance, double index, jsi::Object value) override;
  double getTableSize(jsi::Runtime &rt, jsi::Object instance) override;
};

}


