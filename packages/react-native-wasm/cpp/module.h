#pragma once

#include <jsi/jsi.h>
#include <dlfcn.h>

namespace facebook::react {

class SharedLibraryNativeState : public jsi::NativeState {
public:
  explicit SharedLibraryNativeState(void* handle);
  ~SharedLibraryNativeState();

  SharedLibraryNativeState(SharedLibraryNativeState&& other) = default;
  SharedLibraryNativeState& operator=(SharedLibraryNativeState&& other) = default;

  SharedLibraryNativeState(const SharedLibraryNativeState& other) = delete;
  SharedLibraryNativeState& operator=(const SharedLibraryNativeState& other) = delete;

  template <typename T>
  T get(const char* name) {
    return (T)dlsym(ptr_, name);
  }

  static SharedLibraryNativeState load(const char* name, int mode);

private:
  void* ptr_;
};

}
