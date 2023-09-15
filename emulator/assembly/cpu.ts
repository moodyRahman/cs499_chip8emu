import { read_display, draw } from "./display";

class CPU {
  ram: Array<i32> = new Array<i32>(20);
  rom: Array<string> = new Array<string>(1024);
  time: number = 0;
  constructor() {}

  tick(): number {
    this.time++;
    return this.time;
  }
}

const cpu = new CPU();

export function write_to_memory(location: i32, value: i32): void {
  cpu.ram[location] = value;
}

export function random_color(x: i32, y: i32): void {
  draw(x, y);
}

export function read_from_memory(location: i32): i32 {
  return cpu.ram[location];
}

export function read_all_memory(): Array<i32> {
  return cpu.ram;
}

export function load_rom(contents: string): void {
  cpu.rom = [];
  cpu.rom = contents.split("\n");
}
