#include <jni.h>
#include "react-native-wasm.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_wasm_WasmModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return wasm::multiply(a, b);
}
