(module
  (func $log (import "console" "log") (param f64))

  (global $errno (mut i32) (i32.const 0))
  (global $ELENGTH (export "ELENGTH") i32 (i32.const 1))
  (global $EMARKER (export "EMARKER") i32 (i32.const 2))

  (memory (export "memory") 1)

  (func (export "errno") (result i32)
    get_global $errno
  )

  (func $rerrno
    i32.const 0
    set_global $errno
  )

  (func (export "encodingLength") (param $int f64) (result f64)
    get_local $int
    i64.trunc_u/f64
    call $encodingLength
    f64.convert_u/i64
  )

  (func (export "decodingLength") (param $i f64) (result f64)
    get_local $i
    i64.trunc_u/f64
    call $decodingLength
    f64.convert_u/i64
  )

  (func (export "encode") (param $int f64) (result f64)
    get_local $int
    i64.trunc_u/f64
    call $encode
    f64.convert_u/i64
  )

  (func (export "decode") (param $i f64) (result f64)
    get_local $i
    i64.trunc_u/f64
    call $decode
    f64.convert_u/i64
  )

  (func $encodingLength (param $int i64) (result i64)
    (local $i i64)

    call $rerrno

    block $return
      i64.const 1
      set_local $i

      loop $loop
        get_local $int

        i64.const 2
        i64.const 7
        get_local $i
        i64.mul
        i64.shl

        i64.lt_u
        br_if $return

        get_local $i
        i64.const 1
        i64.add
        tee_local $i

        i64.const 8
        i64.lt_u
        br_if $loop
      end
    end

    get_local $i
  )

  (func $decodingLength (param $i i64) (result i64)
    (local $length i64)
    (local $b i64)

    call $rerrno

    i64.const 1
    set_local $length

    block $return
      loop $loop
        get_local $i
        i32.wrap/i64
        i64.load8_u
        tee_local $b
        i64.clz
        i64.const 56
        i64.sub
        get_local $length
        i64.add
        set_local $length

        get_local $b
        i64.const 0
        i64.ne
        br_if $return

        get_local $i
        i64.const 1
        i64.sub
        tee_local $i

        i64.const 0
        i64.ge_s
        br_if $loop
      end

      get_global $EMARKER
      set_global $errno
    end

    get_local $length
  )

  (func $encode (param $int i64) (result i64)
    (local $length i64)

    call $rerrno

    get_local $int
    call $encodingLength
    set_local $length

    ;;get_local $int
    ;;i64.const 2
    ;;i64.const 7
    ;;get_local $length
    ;;i64.mul
    ;;i64.shl
    ;;i64.const 1
    ;;i64.sub
    ;;i64.eq
    ;;if
    ;;  get_local $length
    ;;  i64.const 1
    ;;  i64.add
    ;;  set_local $length
    ;;end

    i32.const 8

    get_local $length
    i64.const 9
    i64.eq
    if (result i32)
      i32.const 0x80
    else
      i32.const 0
    end

    i32.store8

    i32.const 0

    get_local $int

    get_local $length
    i64.const 9
    i64.eq
    if (result i64)
      i64.const 0
    else
      i64.const 0x80
      get_local $length
      i64.const 1
      i64.sub
      i64.const 7
      i64.mul
      i64.shl
    end

    i64.or
    i64.store

    get_local $length
  )

  (func $decode (param $i i64) (result i64)
    (local $length i64)
    (local $start i64)
    (local $int i64)

    call $rerrno

    block $return
      get_local $i
      call $decodingLength
      set_local $length

      get_global $errno
      br_if $return

      get_local $i
      get_local $length
      i64.const 1
      i64.sub
      i64.sub
      tee_local $start
      i64.const 0
      i64.lt_s
      if
        get_global $ELENGTH
        set_global $errno
        br $return
      end

      get_local $start
      i32.wrap/i64

      i64.load

      i64.const 0x80
      get_local $length
      i64.const 1
      i64.sub
      i64.const 7
      i64.mul
      i64.shl
      i64.xor
      set_local $int
    end

    get_local $int
  )
)
