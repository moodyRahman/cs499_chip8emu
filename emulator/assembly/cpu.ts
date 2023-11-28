import { draw } from "./display";

class Memory {
  // 0x000 - 0x1FF should not be used by programs
  mem: Uint8Array = new Uint8Array(4096);
  // romHash to check loaded ROM
  // hash algorithm is all bytes added together mod 2^32
  romHash: u32 = 0;

  constructor() {
    this.clearMemory();
    this.loadFonts();
  }

  clearMemory(): void {
    for (let i = 0; i < 4096; i++) {
      this.mem[i] = 0;
    }
  }

  read(address: u16): u8 {
    // Truncate address to 12-bits then return data it points to
    return this.mem[address & 0xfff];
  }

  write(address: u16, value: u8): void {
    // Truncate address to 12-bits and data to 8-bits
    // Then write the data at this address
    this.mem[address & 0xfff] = value & 0xff;
  }

  static ogFontTable: StaticArray<u8> = [
    0xf0,
    0x90,
    0x90,
    0x90,
    0xf0, //0
    0x20,
    0x60,
    0x20,
    0x20,
    0x70, //1
    0xf0,
    0x10,
    0xf0,
    0x80,
    0xf0, //2
    0xf0,
    0x10,
    0xf0,
    0x10,
    0xf0, //3
    0x90,
    0x90,
    0xf0,
    0x10,
    0x10, //4
    0xf0,
    0x80,
    0xf0,
    0x10,
    0xf0, //5
    0xf0,
    0x80,
    0xf0,
    0x90,
    0xf0, //6
    0xf0,
    0x10,
    0x20,
    0x40,
    0x40, //7
    0xf0,
    0x90,
    0xf0,
    0x90,
    0xf0, //8
    0xf0,
    0x90,
    0xf0,
    0x10,
    0xf0, //9
    0xf0,
    0x90,
    0xf0,
    0x90,
    0x90, //A
    0xe0,
    0x90,
    0xe0,
    0x90,
    0xe0, //B
    0xf0,
    0x80,
    0x80,
    0x80,
    0xf0, //C
    0xe0,
    0x90,
    0x90,
    0x90,
    0xe0, //D
    0xf0,
    0x80,
    0xf0,
    0x80,
    0xf0, //E
    0xf0,
    0x80,
    0xf0,
    0x80,
    0x80, //F
  ];

  loadFonts(): void {
    for (let i: u8 = 0; i < 80; i++) {
      this.mem[i] = Memory.ogFontTable[i];
    }
  }

  loadROM(romToLoad: Uint8Array): boolean {
    // First check if ROM can fit in RAM available (~3.5k)
    if (romToLoad.length > 0xe00) {
      return false;
    }

    this.romHash = 0;
    // If it fits, store ROM starting at the reset vector (512)
    for (let i = 0; i < romToLoad.length; i++) {
      this.mem[i + 512] = romToLoad[i];
      this.romHash += romToLoad[i];
    }

    // Reload fonts in case of corruption
    this.loadFonts();
    return true;
  }
}

class Display {
  display: Uint8Array = new Uint8Array(256);
  collision: boolean = false;

  //Reference to Chip-8 Memory
  memory: Memory = new Memory();

  loadMemRef(memToLoad: Memory): void {
    this.memory = memToLoad;
  }

  getCollisionValue(): u8 {
    if (this.collision) {
      return 1;
    } else {
      return 0;
    }
  }

  clearDisplay(): void {
    for (let i: u16 = 0; i < 256; i++) {
      this.display[i] = 0;
    }
  }

  drawSprite(x: u8, y: u8, address: u16, length: u8): void {
    this.collision = false;

    // Check if x and y are within bounds
    if (x > 63) {
      return;
    }
    if (y > 31) {
      return;
    }

    // Check if we draw past screen
    let edgeCase: boolean = false;
    if (x > 56) {
      // If x > 56 then we will be drawing past the display edge
      edgeCase = true;
    }

    let xByteLoc: u8 = x >> 3; //divide by 8
    let xBitLoc: u8 = x & 0x7; //keep last 3 bits for remainder

    //For every length of the sprite
    for (let i: u16 = 0; i < length; i++) {
      //Getting address of byte we start drawing in
      let drawAddr: u16 = xByteLoc + ((y + i) << 3); //(x / 8) + (ylocation * 8)
      if (drawAddr > 255) {
        break;
      }
      if (drawAddr < 0) {
        break;
      }
      //Check for collision:
      //We compare the current displayed byte with the new display byte using AND and if the value is anything other than 0
      //then a collision occurred.
      //We only care about the bits we draw into hence the right shift by xBitLoc many bits.
      if (
        (this.display[drawAddr] & (this.memory.read(address + i) >> xBitLoc)) !=
        0
      ) {
        this.collision = true;
      }

      //Draw pixels on screen (uses XOR)
      this.display[drawAddr] ^= this.memory.read(address + i) >> xBitLoc;
      //If we are not drawing past the edge of display, then continue drawing in next byte
      if (!edgeCase && xBitLoc != 0) {
        //Check for collisions first:
        //Comparing current display of next byte with new byte using AND
        //however we only want to check the bits we are drawing into hence the shifting to the left
        //by 8-xBitLoc many bits
        if (
          (this.display[drawAddr + 1] &
            (this.memory.read(address + i) << (8 - xBitLoc))) !=
          0
        ) {
          this.collision = true;
        }

        //Continue drawing
        this.display[drawAddr + 1] ^=
          this.memory.read(address + i) << (8 - xBitLoc);
      }
    }
  }

  draw_pixel(x: u16, y: u16): void {
    if (x < 0 || y < 0 || x > 63 || y > 31) {
      return;
    }

    let bit: u16 = (y << 6) + x; // convert the x-y coordinate to the exact bit we care about
    let byte: u16 = bit >> 3; // which byte this bit belongs to
    let offset: u8 = u8(bit & 0x7); // modulo 8 is extracting the 8 lest significant bits, aka where in the byte do we flip

    // we went to set the byte[offset]
    this.display[byte] = this.display[byte] | (0x80 >> offset);

    // this.display[(y * 64 + x) >> 3] = this.display[(y * 64 + x) >> 3] || (y * 64 + x) && 0x7;
  }
}

class CPU {
  // 16 general purpose 8-bit registers, labeled V0-VF
  V: Uint8Array = new Uint8Array(16);
  // Delay timer register, auto-decrements at a rate of 60hz
  dt: u8 = 0;
  // Sound timer control register, auto-decrements at a rate of 60hz
  st: u8 = 0;
  // Key input register, stores keypad state
  key: u16 = 0;

  // Pseudo-registers
  pc: u16 = 0x200; // Program counter, 512 is the reset vector
  sp: u8 = 0; // Stack pointer
  index: u16 = 0; // Index register is a special register used to store memory addresses

  // Stack contents, the stack is stored in a separate address space
  Stack: Uint16Array = new Uint16Array(16);

  // Memory, display and sound subsystems
  memory: Memory = new Memory();
  display: Display = new Display();
  soundHandler: boolean = false;

  // Instruction register
  CurrInstruction: u16 = 0;

  // Field decode variables
  nnn: u16 = 0; // Lowest 12-bits
  i: u8 = 0; // First (Highest) nibble
  x: u8 = 0; // Second nibble
  y: u8 = 0; // Third nibble
  n: u8 = 0; // Fourth (Lowest) nibble
  kk: u8 = 0; // Lowest byte

  time: i32 = 0;

  constructor(memToLoad: number, displayOutput: number, handleSound: number) {
    // Initialize values with the reset function
    this.reset();
    this.display.loadMemRef(this.memory);
  }

  reset(): void {
    // Clear registers:
    for (let i = 0; i < 16; i++) {
      this.V[i] = 0;
    }
    this.sp = 0;
    this.index = 0;
    this.dt = 0;
    this.st = 0;
    // Set PC to reset vector
    this.pc = 0x200;

    // Clear stack:
    for (let j = 0; j < 16; j++) {
      this.Stack[j] = 0;
    }

    // Reset display
    this.display.clearDisplay();

    // Reset field variables:
    this.nnn = 0;
    this.n = 0;
    this.x = 0;
    this.y = 0;
    this.kk = 0;
  }

  loadMemory(memoryToLoad: Memory): void {
    this.memory = memoryToLoad;
  }

  loadDisplay(displayToLoad: Display): void {
    this.display = displayToLoad;
  }

  loadSound(soundToLoad: any): void {
    this.soundHandler = soundToLoad;
  }

  IRFetch(): void {
    // Load instruction register with 16 bits from PC and PC+1
    this.CurrInstruction = this.memory.read(this.pc) << 8;
    this.CurrInstruction |= this.memory.read(this.pc + 1);
    // Increment PC to next instruction
    this.pc += 2;
  }

  decodeTable_func(inst: u16): void {
    this.nnn = inst & 0x0fff; // Get last 12 bits
    this.i = u8((inst >> 12) & 0x000f); // Get first nibble
    this.x = u8((inst >> 8) & 0x000f); // Get second nibble
    this.y = u8((inst >> 4) & 0x000f); // Get third nibble
    this.n = u8(inst & 0x000f); // Get fourth nibble
    this.kk = u8(inst & 0x00ff); // Get last byte

    switch (this.i) {
      case 0x0:
        // CLS
        if (this.nnn == 0x0e0) {
          this.display.clearDisplay();
        }
        // RET
        else if (this.nnn == 0x0ee) {
          if (this.sp >= 0) {
            this.sp--;
          } else {
            console.log("Error: tried to decrement SP below 0");
          }
          this.pc = this.Stack[this.sp];
        }
        // SYS
        else {
          console.log("Error: Cannot call SYS() function!");
        }
        break;
      // JP nnn
      case 0x1:
        this.pc = this.nnn;
        break;
      // CALL
      case 0x2:
        this.Stack[this.sp] = this.pc;
        if (this.sp === 15) {
          console.log("Error: Cannot increment Stack to value greater than 15");
        } else {
          this.sp++;
        }
        this.pc = this.nnn;
        break;
      // SE kk
      case 0x3:
        if (this.V[this.x] === this.kk) {
          this.pc += 2;
        }
        break;
      // SNE kk
      case 0x4:
        if (this.V[this.x] != this.kk) {
          this.pc += 2;
        }
        break;
      // SE reg
      // WIP ADD EXTRA DECODING NIBBLE
      case 0x5:
        if (this.V[this.x] === this.V[this.y]) {
          this.pc += 2;
        }
        break;
      // LD kk
      case 0x6:
        this.V[this.x] = this.kk;
        break;
      // ADD kk
      case 0x7:
        this.V[this.x] += this.kk;
        break;
      case 0x8:
        switch (this.n) {
          // LD reg
          case 0x0:
            this.V[this.x] = this.V[this.y];
            break;
          // OR
          case 0x1:
            this.V[this.x] |= this.V[this.y];
            break;
          // AND
          case 0x2:
            this.V[this.x] &= this.V[this.y];
            break;
          // XOR
          case 0x3:
            this.V[this.x] ^= this.V[this.y];
            break;
          // ADD reg
          case 0x4:
            this.V[0xf] = 0;
            let value = this.V[this.x] + this.V[this.y];
            if (value > 255) {
              this.V[0xf] = 1;
              value &= 0xff;
            }
            this.V[this.x] = value;
            break;
          // SUB
          case 0x5:
            this.V[0xf] = 0;
            if (this.V[this.x] > this.V[this.y]) {
              this.V[0xf] = 1;
            }
            this.V[this.x] -= this.V[this.y];
            break;
          // SHR
          case 0x6:
            let overflow = this.V[this.x] % 2;
            this.V[0xf] = overflow;
            this.V[this.x] = this.V[this.x] >> 1;
            break;
          // SUBN
          case 0x7:
            this.V[0xf] = 0;
            if (this.V[this.y] > this.V[this.x]) {
              this.V[0xf] = 1;
            }
            this.V[this.x] = this.V[this.y] - this.V[this.x];
            break;
          // SHL
          case 0xe:
            let checker = this.V[this.x] >> 7; //moves MSB to LSB place
            this.V[0xf] = checker;
            this.V[this.x] = this.V[this.x] << 1;
            break;
          // WIP, better error handling here
          default:
            console.log("ERROR! INVALID 0x8 TYPE INSTRUCTION");
            break;
        }
        // WIP Remove debug instruction!
        if (this.n == 0x8) {
          console.log("here");
          console.log(this.x.toString());
          console.log(this.y.toString());
          this.display.draw_pixel(this.x, this.y);
        }
        break;
      // SNE reg
      case 0x9:
        if (this.V[this.x] != this.V[this.y]) {
          this.pc += 2;
        }
        break;
      // LD I
      case 0xa:
        this.index = this.nnn;
        break;
      // JP reg
      case 0xb:
        this.pc = this.nnn + this.V[0];
        break;
      // RND
      case 0xc:
        let randFloat: f64 = Math.floor(Math.random() * 256);
        let randInt: u8 = <u8>randFloat; //TypeCasting f64 -> u8
        this.V[this.x] = randInt & this.kk;
        break;
      // DRW
      case 0xd:
        this.display.drawSprite(
          this.V[this.x],
          this.V[this.y],
          this.index,
          this.n
        );
        this.V[0xf] = this.display.getCollisionValue();
        break;
      case 0xe:
        // SKP
        if (this.kk == 0x9e) {
          if ((this.key & (1 << (this.V[this.x] & 0xf))) != 0) {
            this.pc += 2;
          }
        }
        // SKNP
        else if (this.kk == 0xa1) {
          if ((this.key & (1 << (this.V[this.x] & 0xf))) == 0) {
            this.pc += 2;
          }
        }
        // WIP, better error handling here
        else {
          console.log("ERROR! INVALID 0xE TYPE INSTRUCTION");
        }
        break;
      case 0xf:
        // Note for those at home,
        // I didnt change this out to a switch case block
        // because the comparison values are not very linear
        // (aka they jump around alot) which would make them
        // a poor fit for the jump tables a switch block makes

        // LD ret
        if (this.kk == 0x07) {
          this.V[this.x] = this.dt;
        }
        // LD key
        else if (this.kk == 0x0a) {
          if (this.key == 0) {
            this.pc -= 2;
          } else {
            for (let i = 0; i < 16; i++) {
              if (((1 << i) & this.key) != 0) {
                this.V[this.x] = i;
                break;
              }
            }
          }
        }
        // LD dt
        else if (this.kk == 0x15) {
          this.dt = this.V[this.x];
        }
        // LD st
        else if (this.kk == 0x18) {
          this.st = this.V[this.x];
        }
        // ADD I
        else if (this.kk == 0x1e) {
          this.index += this.V[this.x];
        }
        // LD sprite
        else if (this.kk == 0x29) {
          this.index = this.V[this.x] * 5;
        }
        // LD bcd
        else if (this.kk == 0x33) {
          let bcd = this.V[this.x];
          this.memory.write(this.index, bcd / 100); //writes hundreds place into memory at address: Index
          bcd /= 10; //removes ones place
          bcd %= 10; //Singles out tens place;
          this.memory.write(this.index + 1, bcd); //writes tens place into memory at address: index + 1
          bcd = this.V[this.x];
          bcd %= 10; //singles out ones place;
          this.memory.write(this.index + 2, bcd); // writes ones place into memory at address: index + 2
        }
        // Save reg
        else if (this.kk == 0x55) {
          for (let i: u8 = 0; i <= this.x; i++) {
            this.memory.write(this.index + i, this.V[i]);
          }
        }
        // Restore reg
        else if (this.kk == 0x65) {
          for (let i: u8 = 0; i <= this.x; i++) {
            this.V[i] = this.memory.read(this.index + i);
          }
        }
        // WIP, better error handling here
        else {
          console.log("ERROR! INVALID 0xF TYPE INSTRUCTION");
        }
        break;
    }
  }

  tick(): void {
    const load =
      (u16(this.memory.read(this.pc)) << 8) | this.memory.read(this.pc + 1);
    this.pc += 2;
    this.decodeTable_func(load);
  }
}

/**/
// start defining the high level API for the CPU here
/**/

const cpu = new CPU(0, 0, 0);

export function read_instruction(inp: u16): void {
  cpu.decodeTable_func(inp);
}

export function read_all_registers(): Uint16Array {
  let out: Uint16Array = new Uint16Array(38);
  for (let x = 0; x < cpu.V.length; x++) {
    out[x] = cpu.V[x];
  }

  for (let x = 0; x < cpu.V.length; x++) {
    out[x + 16] = cpu.Stack[x];
  }
  out[32] = cpu.pc;
  out[33] = cpu.sp;
  out[34] = cpu.index;
  out[35] = cpu.dt;
  out[36] = cpu.key;
  out[37] = cpu.st;
  return out;
}

export function ram_around_address(
  left: u16,
  right: u16,
  address: u16
): Uint8Array {
  return cpu.memory.mem.slice(address - left, address + right + 1);
}

// if we can get some way to trigger a callback in javascript when the display gets updated, that would be ideal
// until then, we'll just have to keep polling this function and rendering it.
export function display(): Uint8Array {
  return cpu.display.display;
}

export function debug_set_pixel(x: u8, y: u8): void {
  cpu.display.draw_pixel(x, y);
}

export function load_rom(rom: Uint8Array): void {
  cpu.memory.loadROM(rom);

  for (let x: u16 = 0; x < 5; x++) {
    console.log(cpu.memory.read(512 + x).toString(16));
  }
}

export function read_mem(add: u16): u8 {
  return cpu.memory.read(add);
}

export function tick(): u16 {
  cpu.tick();
  return cpu.pc;
}

export function reset(): void {
  cpu.reset();
}

export function ram_dump(): Uint8Array {
  return cpu.memory.mem;
}

export function get_hash(): u32 {
  return cpu.memory.romHash;
}

export function set_key(key_in: u16): void {
  cpu.key = key_in;
}

export function get_key(): u16 {
  return cpu.key;
}

export function decrement_timers(): void {
  if (cpu.dt > 0) {
    cpu.dt -= 1;
  }
  if (cpu.st > 0) {
    cpu.st -= 1;
  }
}

export function convert_inst_to_string(inst: u16): string {
  let nnn = inst & 0x0fff; //gets last 12 instruction bits (0 through 11)
  let n = u8(inst & 0x000f); //gets last 4 instruction bits (0 through 3)
  let x = u8((inst >> 8) & 0x000f); //gets instruction bits 8 through 11 (shifts 8 places to get them back to LSB)
  let y = u8((inst >> 4) & 0x000f); //gets instruction bits 4 through 7 (shifts 4 places to get them back to LSB)
  let kk = u8(inst & 0x00ff); //gets last 8 instruction bits (0 through 7)
  let i = u8((inst >> 12) & 0x000f); // gets first 4 bits of instruction

  if (inst == 0) {
    return "no op";
  }

  if (i == 0x0) {
    if (nnn == 0x0e0) {
      return "clearing";
    }
    if (nnn == 0x0ee) {
      return "returning";
    } else {
      return "syscall";
    }
  } else if (i == 0x1) {
    return "jumping to " + nnn.toString(16);
  } else if (i == 0x2) {
    return "call " + nnn.toString(16);
  } else if (i == 0x3) {
    return "sebyte " + x.toString(16) + " " + kk.toString(16);
  } else if (i == 0x4) {
    return "snebyte " + x.toString(16) + " " + kk.toString(16);
  } else if (i == 0x5) {
    return "skip " + x.toString(16) + " " + y.toString(16);
  } else if (i == 0x6) {
    return "ldbyte " + x.toString(16) + " " + kk.toString(16);
  } else if (i == 0x7) {
    return "add byte " + x.toString(16) + " " + kk.toString(16);
  } else if (i == 0x8) {
    if (n == 0x0) {
      return "ld register " + x.toString(16) + " " + y.toString(16);
    }
    if (n == 0x1) {
      return "or " + x.toString(16) + " " + y.toString(16);
    }
    if (n == 0x2) {
      return "and " + x.toString(16) + " " + y.toString(16);
    }
    if (n == 0x3) {
      return "xor " + x.toString(16) + " " + y.toString(16);
    }
    if (n == 0x4) {
      return "add register " + x.toString(16) + " " + y.toString(16);
    }
    if (n == 0x5) {
      return "subtract register " + x.toString(16) + " " + y.toString(16);
    }
    if (n == 0x6) {
      return "shr " + x.toString(16) + " " + y.toString(16);
    }
    if (n == 0x7) {
      return "subn " + x.toString(16) + " " + y.toString(16);
    }
    if (n == 0xe) {
      return "shl " + x.toString(16) + " " + y.toString(16);
    }

    if (n == 0x8) {
      return "draw pixel debug " + x.toString(16) + " " + y.toString(16);
    }
  } else if (i == 0x9) {
    return "sne " + x.toString(16) + " " + y.toString(16);
  } else if (i == 0xa) {
    return "ld index " + nnn.toString(16);
  } else if (i == 0xb) {
    return "jp register " + nnn.toString(16);
  } else if (i == 0xc) {
    return "random " + x.toString(16) + " " + kk.toString(16);
  } else if (i == 0xd) {
    return (
      "draw " + x.toString(16) + " " + y.toString(16) + " " + n.toString(16)
    );
  } else if (i == 0xe) {
    if (kk == 0x9e) {
      return "skip " + x.toString(16);
    } else if (kk == 0xa1) {
      return "sknp " + x.toString(16);
    }
  } else if (i == 0xf) {
    if (kk == 0x07) {
      return "ld ret " + x.toString(16);
    } else if (kk == 0x0a) {
      return "ld key " + x.toString(16);
    } else if (kk == 0x15) {
      return "ld ter" + x.toString(16);
    } else if (kk == 0x18) {
      return "ld ser " + x.toString(16);
    } else if (kk == 0x1e) {
      return "add index " + x.toString(16);
    } else if (kk == 0x29) {
      return "ld sprite" + x.toString(16);
    } else if (kk == 0x33) {
      return "ld br" + x.toString(16);
    } else if (kk == 0x55) {
      return "ld mem wr" + x.toString(16);
    } else if (kk == 0x65) {
      return "ld mem rd " + x.toString(16);
    }
  }
  return "wtf";
}
