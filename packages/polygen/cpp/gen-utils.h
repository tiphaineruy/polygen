#pragma once

/// Generates a context struct for specified import
#define GEN_IMPORT_CONTEXT_TYPE(name, rootCtx) \
struct name { \
  rootCtx* root;\
  facebook::jsi::Runtime& rt;\
  facebook::jsi::Object importObj;\
}

#define INIT_IMPORT_CTX(field, importName) field{&rootCtx, rt, this->importObject.getPropertyAsObject(rt, importName)}


#define HOSTFN(name, argCount)         \
  jsi::Function::createFromHostFunction( \
    rt, \
    jsi::PropNameID::forAscii(rt, name), \
    argCount, \
    [=](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *args, size_t count) -> jsi::Value
