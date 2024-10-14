package com.wasm

import com.facebook.react.bridge.ReactApplicationContext

abstract class WasmSpec internal constructor(context: ReactApplicationContext) :
  NativeWasmSpec(context) {
}
