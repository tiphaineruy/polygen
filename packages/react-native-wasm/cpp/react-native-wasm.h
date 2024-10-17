#pragma once

#include <ReactCommon/TurboModule.h>
#include <RNWasmSpecJSI.h>

namespace facebook::react {

class ReactNativeWebAssembly: public NativeWebAssemblyCxxSpecJSI {
  explicit ReactNativeWebAssembly(std::shared_ptr<CallInvoker> jsInvoker) :NativeWebAssemblyCxxSpecJSI(jsInvoker) {}


}

}


