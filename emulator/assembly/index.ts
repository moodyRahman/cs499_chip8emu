// The entry file of your WebAssembly module.
import { write_to_memory, read_from_memory, read_all_memory, cpu } from "./cpu";
import { draw, read_display, buffer } from "./display";

import { JSON } from "json-as";

let internal_counter: i32 = 0;

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function add_internal(): void {
  internal_counter++;
}

export function read_internal(): i32 {
  return internal_counter;
}

export function trigger_cpu_tick(): void {
  cpu.tick();
}

export function read_cpu_tick(): i32 {
  return cpu.time;
}

// @ts-ignore
@json
class Data {
  name!: string;
}

export function data_test(): string {
  let x: Data = {
    name: "moody",
  };

  return JSON.stringify(x);
}

export { buffer };

// export { write_to_memory, read_from_memory, read_all_memory };
