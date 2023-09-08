var arr = new Array<i32>(10);

export function write_to_memory(location: i32, value: i32): void {
  arr[location] = value;
}

export function read_from_memory(location: i32): i32 {
  return arr[location];
}
