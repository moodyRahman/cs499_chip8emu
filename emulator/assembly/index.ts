// The entry file of your WebAssembly module.
import { write_to_memory, read_from_memory, read_all_memory, cpu } from "./cpu";
import { draw, read_display, buffer } from "./display";

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

export { buffer };

// export { write_to_memory, read_from_memory, read_all_memory };
