#pragma once

#include <jsi/jsi.h>

namespace facebook::react {

struct NativeStateHelper {
  /**
   * Wraps speciifed native state into `jsi::Object` and returns it.
   */
  template <typename T>
  static jsi::Object wrap(jsi::Runtime& rt, T&& state) {
    jsi::Object holder {rt};
    holder.setNativeState(rt, std::move(state));
    return holder;
  }

  /**
   * Attaches specified object to holder object, assuring that object has no state already attached.
   */
  template <typename T>
  static void attach(jsi::Runtime& rt, const jsi::Object& holder, T&& state) {
    assert(!holder.hasNativeState(rt));
    holder.setNativeState(rt, std::move(state));
  }

  template <typename T>
  static std::shared_ptr<T> tryGet(jsi::Runtime& rt, const jsi::Object& holder) {
    auto value = std::dynamic_pointer_cast<T>(holder.getNativeState(rt));
    if (value == nullptr) {
      throw new jsi::JSError(rt, "Argument passed is missing native state or is of invalid type");
    }

    return value;
  }
};

}
