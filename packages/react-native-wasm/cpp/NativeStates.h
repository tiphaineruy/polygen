#pragma once

#include <memory>
#include <jsi/jsi.h>
#include "Module.h"
#include "Memory.h"

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


class MemoryNativeState: public jsi::NativeState, public jsi::MutableBuffer {
public:
  explicit MemoryNativeState(std::unique_ptr<Memory>&& memory): memory_(std::move(memory)) {}
  
  const Memory& getMemory() const {
    return *memory_;
  }
  
  size_t size() const {
    return memory_->getMemory()->size;
  }
  
  uint8_t* data() {
    return memory_->getMemory()->data;
  }
  
private:
  std::unique_ptr<Memory> memory_;
};

}
