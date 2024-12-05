(module
  ;; Import a global variable from the host environment
  (import "env" "iterations" (global $max_iterations (mut i32)))
;;
;;  ;; Import a table from the host environment
;;  (import "env" "table" (table 10 funcref))

  ;; Export a global variable tracking current iterations
  (global (export "currentIterations") (mut i32) (i32.const 0))

  ;; Function to compute fibonacci number
  (func $fibonacci (param $n i32) (result i32)
    (if (result i32)
      (i32.le_s (local.get $n) (i32.const 1))
      (then
        (local.get $n)
      )
      (else
        (i32.add
          (call $fibonacci (i32.sub (local.get $n) (i32.const 1)))
          (call $fibonacci (i32.sub (local.get $n) (i32.const 2)))
        )
      )
    )
  )

  ;; Export the fibonacci function
  (export "fibonacci" (func $fibonacci))

  ;; Create and export a table
  (table $t0 2 funcref)
  (elem (i32.const 0) $fibonacci)
  (export "table" (table $t0))
)
