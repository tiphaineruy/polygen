#pragma once

#include <span>

const uint8_t MAGIC_NUMBER[] = {'C', 'K', 'W', 'A', 'S', 'M'};

struct ModuleMetadataView {
  char magic[6];
  uint64_t size;
  uint8_t checksum[32];
  const char name[1];
  
  static ModuleMetadataView fromBuffer(std::span<uint8_t> moduleData) {
    assert(moduleData.size() >= sizeof(ModuleMetadataView));
    return *((ModuleMetadataView*)moduleData.data());
  }
  
  static bool isMetadata(std::span<uint8_t> moduleData) {
    return moduleData.size() >= 6 && memcmp(moduleData.data(), MAGIC_NUMBER, 6) == 0;
  }
};
