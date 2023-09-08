// The entry file of your WebAssembly module.
import { write_to_memory, read_from_memory } from "./cpu";

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

export { write_to_memory, read_from_memory };
