var arr = new Array<i32>(10);
class CPU {
  ram: Array<i32> = new Array<i32>(1024);
  rom: Array<string> = new Array<string>(1024);
  constructor() {}
}

const cpu = new CPU();

export function write_to_memory(location: i32, value: i32): void {
  cpu.ram[location] = value;
}

export function read_from_memory(location: i32): i32 {
  return cpu.ram[location];
}

export function read_all_memory(): Array<i32> {
  return arr;
}

export function load_rom(contents: string): void {
  cpu.rom = [];
  cpu.rom = contents.split("\n");
}
