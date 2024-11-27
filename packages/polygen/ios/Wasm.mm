#import "Wasm.h"
#include <ReactCommon/CxxTurboModuleUtils.h>

@implementation Wasm

+ (void)load {
  facebook::react::registerCxxModuleToGlobalModuleMap(
  std::string(facebook::react::ReactNativeWebAssembly::kModuleName),
  [&](std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
  return std::make_shared<facebook::react::ReactNativeWebAssembly>(jsInvoker);
});
}

@end
