#include "bridge.h"
#include <ReactNativeWebAssemblyExample/example.h>

namespace facebook::react {

typedef int (*w2c_fib_func)(w2c_example* example, int val);

jsi::Object createExampleModule(jsi::Runtime &rt, SharedLibraryNativeState& mod, jsi::Object importObject) {
  jsi::Object exports {rt};
    
  const auto fibFunc = [&mod](jsi::Runtime& rt, const jsi::Value& thisVal, const jsi::Value* args, size_t count) -> jsi::Value {
    auto func = mod.get<w2c_fib_func>("w2c_fib");
    auto val = args[0].asNumber();
//    auto res = func(val);
    return {5};
  };
  const auto fibName = jsi::PropNameID::forAscii(rt, "fib");
  
  exports.setProperty(rt, "fib", jsi::Function::createFromHostFunction(rt, fibName, 0, std::move(fibFunc)));
  
  return exports;
}

}
