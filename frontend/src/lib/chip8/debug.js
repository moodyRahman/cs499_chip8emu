async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
      "console.log"(text) {
        // ~lib/bindings/dom/console.log(~lib/string/String) => void
        text = __liftString(text >>> 0);
        console.log(text);
      },
      seed() {
        // ~lib/builtins/seed() => f64
        return (() => {
          // @external.js
          return Date.now() * Math.random();
        })();
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    read_all_registers() {
      // assembly/cpu/read_all_registers() => ~lib/typedarray/Uint16Array
      return __liftTypedArray(Uint16Array, exports.read_all_registers() >>> 0);
    },
    ram_around_address(left, right, address) {
      // assembly/cpu/ram_around_address(u16, u16, u16) => ~lib/typedarray/Uint8Array
      return __liftTypedArray(Uint8Array, exports.ram_around_address(left, right, address) >>> 0);
    },
    display() {
      // assembly/cpu/display() => ~lib/typedarray/Uint8Array
      return __liftTypedArray(Uint8Array, exports.display() >>> 0);
    },
    load_rom(rom) {
      // assembly/cpu/load_rom(~lib/typedarray/Uint8Array) => void
      rom = __lowerTypedArray(Uint8Array, 8, 0, rom) || __notnull();
      exports.load_rom(rom);
    },
    ram_dump() {
      // assembly/cpu/ram_dump() => ~lib/typedarray/Uint8Array
      return __liftTypedArray(Uint8Array, exports.ram_dump() >>> 0);
    },
    get_hash() {
      // assembly/cpu/get_hash() => u32
      return exports.get_hash() >>> 0;
    },
    set_key_array(key_in) {
      // assembly/cpu/set_key_array(~lib/array/Array<u8>) => void
      key_in = __lowerArray(__setU8, 12, 0, key_in) || __notnull();
      exports.set_key_array(key_in);
    },
    convert_inst_to_string(inst) {
      // assembly/cpu/convert_inst_to_string(u16) => ~lib/string/String
      return __liftString(exports.convert_inst_to_string(inst) >>> 0);
    },
    read_display() {
      // assembly/display/read_display() => ~lib/array/Array<~lib/array/Array<bool>>
      return __liftArray(pointer => __liftArray(pointer => __getU8(pointer) != 0, 0, __getU32(pointer)), 2, exports.read_display() >>> 0);
    },
    buffer: {
      // assembly/display/buffer: ~lib/array/Array<~lib/array/Array<bool>>
      valueOf() { return this.value; },
      get value() {
        return __liftArray(pointer => __liftArray(pointer => __getU8(pointer) != 0, 0, __getU32(pointer)), 2, exports.buffer.value >>> 0);
      },
      set value(value) {
        exports.buffer.value = __lowerArray((pointer, value) => { __setU32(pointer, __lowerArray(__setU8, 4, 0, value) || __notnull()); }, 5, 2, value) || __notnull();
      }
    },
  }, exports);
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __liftArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const
      dataStart = __getU32(pointer + 4),
      length = __dataview.getUint32(pointer + 12, true),
      values = new Array(length);
    for (let i = 0; i < length; ++i) values[i] = liftElement(dataStart + (i << align >>> 0));
    return values;
  }
  function __lowerArray(lowerElement, id, align, values) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__pin(exports.__new(16, id)) >>> 0;
    __setU32(header + 0, buffer);
    __dataview.setUint32(header + 4, buffer, true);
    __dataview.setUint32(header + 8, length << align, true);
    __dataview.setUint32(header + 12, length, true);
    for (let i = 0; i < length; ++i) lowerElement(buffer + (i << align >>> 0), values[i]);
    exports.__unpin(buffer);
    exports.__unpin(header);
    return header;
  }
  function __liftTypedArray(constructor, pointer) {
    if (!pointer) return null;
    return new constructor(
      memory.buffer,
      __getU32(pointer + 4),
      __dataview.getUint32(pointer + 8, true) / constructor.BYTES_PER_ELEMENT
    ).slice();
  }
  function __lowerTypedArray(constructor, id, align, values) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__new(12, id) >>> 0;
    __setU32(header + 0, buffer);
    __dataview.setUint32(header + 4, buffer, true);
    __dataview.setUint32(header + 8, length << align, true);
    new constructor(memory.buffer, buffer, length).set(values);
    exports.__unpin(buffer);
    return header;
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  let __dataview = new DataView(memory.buffer);
  function __setU8(pointer, value) {
    try {
      __dataview.setUint8(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint8(pointer, value, true);
    }
  }
  function __setU32(pointer, value) {
    try {
      __dataview.setUint32(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint32(pointer, value, true);
    }
  }
  function __getU8(pointer) {
    try {
      return __dataview.getUint8(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint8(pointer, true);
    }
  }
  function __getU32(pointer) {
    try {
      return __dataview.getUint32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint32(pointer, true);
    }
  }
  return adaptedExports;
}
export const {
  memory,
  read_instruction,
  read_all_registers,
  ram_around_address,
  display,
  debug_set_pixel,
  load_rom,
  read_mem,
  tick,
  reset,
  ram_dump,
  get_hash,
  set_key,
  get_key,
  set_key_array,
  decrement_timers,
  convert_inst_to_string,
  draw,
  read_display,
  init,
  buffer,
  add,
  add_internal,
  read_internal,
} = await (async url => {
  console.log("here", url)
  return instantiate(
    await (async () => {
      const res = globalThis.fetch(url)
      try { return await globalThis.WebAssembly.compileStreaming(res); }
      catch (error) {
        return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url));
      }
    })(), {
  }
  )
})(new URL("https://moodyrahman.com/files/sv8_resources/wasm/debug.wasm"));
