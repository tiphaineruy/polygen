#pragma once

#include <memory>
#include <string>
#include <vector>
#include <jsi/jsi.h>
#include "Module.h"

namespace facebook::react {

const std::vector<std::string>& getAvailableModules();
std::unique_ptr<Module> loadWebAssemblyModule(const std::string& name);

}
