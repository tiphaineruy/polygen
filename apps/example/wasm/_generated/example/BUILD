load("@rules_apple//apple:apple.bzl", "apple_xcframework")

cc_library(
  name = "lib",
  srcs = glob(["*.h", "*.c"]),
  linkstatic = False,
)

apple_xcframework(
  name = "rn_wasmlib_example",
  bundle_id = "org.callstack.react_native_webassembly.wrapper.example",
  infoplists = ["Info.plist"],
  ios = {
    "simulator": ["x86_64", "arm64"],
    "device": ["arm64"]
  },
  minimum_os_versions = {
    "ios": "11.0"
  },
  deps = [":lib"],
)
