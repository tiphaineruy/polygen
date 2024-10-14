#ifdef __cplusplus
#import "react-native-wasm.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNWasmSpec.h"

@interface Wasm : NSObject <NativeWasmSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Wasm : NSObject <RCTBridgeModule>
#endif

@end
