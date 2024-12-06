(module
  (type (;0;) (func (param i32) (result i32)))
  (import "env" "iterations" (global (;0;) (mut i32)))
  (func (;0;) (type 0) (param i32) (result i32)
    local.get 0
    i32.const 1
    i32.le_s
    if (result i32)  ;; label = @1
      local.get 0
    else
      local.get 0
      i32.const 1
      i32.sub
      call 0
      local.get 0
      i32.const 2
      i32.sub
      call 0
      i32.add
    end)
  (table (;0;) 2 funcref)
  (global (;1;) (mut i32) (i32.const 0))
  (export "fibonacci" (func 0))
  (export "table" (table 0))
  (export "currentIterations" (global 1))
  (elem (;0;) (i32.const 0) func 0))
