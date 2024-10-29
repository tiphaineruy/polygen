#include "module.h"

namespace facebook::react {

SharedLibraryNativeState::SharedLibraryNativeState(void* handle): ptr_(handle) {}

SharedLibraryNativeState::~SharedLibraryNativeState() {
  dlclose(this->ptr_);
  this->ptr_ = nullptr;
}

SharedLibraryNativeState SharedLibraryNativeState::load(const char* name, int mode) {
  return SharedLibraryNativeState { dlopen(name, mode) };
}

}
