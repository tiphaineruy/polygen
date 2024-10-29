#pragma once

#include "module.h"

namespace facebook::react {

jsi::Object createExampleModule(jsi::Runtime& rt, SharedLibraryNativeState& mod, jsi::Object importObject);

};
