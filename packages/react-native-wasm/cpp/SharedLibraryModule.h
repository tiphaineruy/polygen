#pragma once

#include "Module.h"
#include <dlfcn.h>

namespace facebook::react {

class SharedLibraryModule : public Module {
public:
  explicit SharedLibraryModule(const std::string& name, void* handle): Module(name), ptr_(handle) {}
  ~SharedLibraryModule() {
    dlclose(this->ptr_);
    this->ptr_ = nullptr;
  }

  SharedLibraryModule(SharedLibraryModule&& other) = default;
  SharedLibraryModule& operator=(SharedLibraryModule&& other) = default;

  SharedLibraryModule(const SharedLibraryModule& other) = delete;
  SharedLibraryModule& operator=(const SharedLibraryModule& other) = delete;

  template <typename T>
  T get(const char* name) {
    return (T)dlsym(ptr_, name);
  }

  static SharedLibraryModule&& load(const char* name, int mode) {
    return SharedLibraryModule { name, dlopen(name, mode) };
  }

private:
  void* ptr_;
};

}
