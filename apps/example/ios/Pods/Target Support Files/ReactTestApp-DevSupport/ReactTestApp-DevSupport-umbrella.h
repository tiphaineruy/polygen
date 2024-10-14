#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "ReactTestApp-DevSupport-Bridging-Header.h"
#import "ReactTestApp-DevSupport.h"

FOUNDATION_EXPORT double ReactTestApp_DevSupportVersionNumber;
FOUNDATION_EXPORT const unsigned char ReactTestApp_DevSupportVersionString[];

