#pragma once

#include <jsi/jsi.h>
#include <ReactNativePolygen/wasm-rt.h>
#include "Table.h"

namespace facebook::react {

class FuncRefTable: public Table {
public:
  explicit FuncRefTable(wasm_rt_funcref_table_t* table): table_(table) {}
  explicit FuncRefTable(size_t initialSize, size_t maxSize) {
    this->table_ = &this->ownedTable_;
    wasm_rt_allocate_funcref_table(this->table_, initialSize, maxSize);
  }
  
  ~FuncRefTable() {
    if (this->isOwned()) {
      wasm_rt_free_funcref_table(this->table_);
    }
  }
  
  bool isOwned() const override {
    return &ownedTable_ == table_;
  }
  
  Kind getKind() const override {
    return Kind::FuncRef;
  }
  
  size_t getSize() const override {
    return this->table_->size;
  }
  
  size_t getCapacity() const override {
    return this->table_->max_size;
  }
  
  wasm_rt_funcref_t getElement(size_t index) {
    return this->table_->data[index];
  }
  
  void grow(ptrdiff_t delta) {
    wasm_rt_grow_funcref_table(this->table_, delta, { nullptr, nullptr, nullptr, nullptr });
  }
  
protected:
  wasm_rt_funcref_table_t ownedTable_;
  wasm_rt_funcref_table_t* table_;
};

}
