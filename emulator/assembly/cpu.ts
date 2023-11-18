import { draw } from "./display";

//Memory class
class Memory {
  //4,096 bytes of RAM
  mem: Uint8Array = new Uint8Array(4096);
  //Locations 0x000 through 0x1FF should not be used by programs

  //Constructor and Functions
  constructor() {
    this.clear();
    this.loadFonts();
  }

  clear(): void {
    //set all entries in Memory to 0
    for (let i = 0; i < 4096; i++) {
      this.mem[i] = 0;
    }
  }

  read(address: u16): u8 {
    //get the entry stored in Memory at address provided
    //ensure that the address does not overflow by only taking in the last 12 bits of the address parameter
    // console.log("reading memory: " + (address & 0xfff).toString(16));
    return this.mem[address & 0xfff];
  }

  write(address: u16, value: u8): void {
    //store an entry in Memory at address provided
    //ensure that the address does not overflow by only taking in the last 12 bits of the address parameter
    //Value provided as parameter should only fit into one byte of space
    this.mem[address & 0xfff] = value & 0xff;
  }

  //Font function should implement by Thursday
  // prettier-ignore
  static ogFontTable: StaticArray<u8> = [
		0xF0, 0x90, 0x90, 0x90, 0xF0, //0
		0x20, 0x60, 0x20, 0x20, 0x70, //1
		0xF0, 0x10, 0XF0, 0x80, 0xF0, //2
		0xF0, 0x10, 0xF0, 0x10, 0xF0, //3
		0x90, 0x90, 0xF0, 0x10, 0x10, //4
		0xF0, 0x80, 0xF0, 0x10, 0xF0, //5
		0xF0, 0x80, 0xF0, 0x90, 0xF0, //6
		0xF0, 0x10, 0x20, 0x40, 0x40, //7
		0xF0, 0x90, 0xF0, 0x90, 0xF0, //8
		0xF0, 0x90, 0xF0, 0x10, 0xF0, //9
		0xF0, 0x90, 0xF0, 0x90, 0x90, //A
		0xE0, 0x90, 0xE0, 0x90, 0xE0, //B
		0xF0, 0x80, 0x80, 0x80, 0xF0, //C
		0xE0, 0x90, 0x90, 0x90, 0xE0, //D
		0xF0, 0x80, 0xF0, 0x80, 0xF0, //E
		0xF0, 0x80, 0xF0, 0x80, 0x80  //F
	]

  loadFonts(): void {
    //Load fonts into the first 80 bytes of memory
    for (let i: u8 = 0; i < 80; i++) {
      this.mem[i] = Memory.ogFontTable[i];
    }
  }

  //Load ROM function
  loadROM(romToLoad: Uint8Array): boolean {
    if (romToLoad.length > 0xe00) {
      return false; //If file byte length is greater than 3584 bytes, file is too big and cannot execute (it doesnt go past RAM limit)
    }

    for (let i = 0; i < romToLoad.length; i++) {
      this.mem[i + 512] = romToLoad[i]; //Store ROM bytes into memory starting from address 512 and on
      //remember, addresses 0-512 are reserved for interpreter
    }

    this.loadFonts();
    return true; //If loadROM function sucessfully executed, return true;
  }
}

class Display {
  //We only need 1 bit per pixel (32x64 pixels = 2048 bits = 256 bytes)
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
    //Set all pixels to 0 in mem
    for (let i: u16 = 0; i < 256; i++) {
      this.display[i] = 0;
    }
  }

  drawSprite(x: u8, y: u8, address: u16, length: u8): void {
    //Check if x and y do not go past display boundry
    if (x > 63) {
      return;
    }
    if (y > 31) {
      return;
    }

    //Check if we draw past screen
    let edgeCase: boolean = false;
    if (x > 56) {
      //if x > 56 then we will be drawing past the display edge
      edgeCase = true;
    }

    let xByteLoc: u8 = x >> 3; //divide by 8
    let xBitLoc: u8 = x & 0x7; //keep last 3 bits for remainder

    //For every length of the sprite
    for (let i: u16 = 0; i < length; i++) {
      //Getting address of byte we start drawing in
      let drawAddr: u16 = xByteLoc + ((y + i) << 3); //(x / 8) + (ylocation * 8)

      //Check for collision:
      //We compare the current displayed byte with the new display byte using AND and if the value is anything other than 0
      //then a collision occured.
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

//CPU class
class CPU {
  //16 8 bit registers are needed
  //registers are labeled V(0-F)
  V: Uint8Array = new Uint8Array(16);
  //VF is never used by a program as it is reserved as a flag for some instructions

  //Special pseudo-registers not accessible to Chip-8 programs
  pc: u16 = 0x200; //used to store the currently executing address (starts at address 0x200 which is where most chip-8 programs start)
  sp: u8 = 0; //used to point to the topmost level of the stack
  index: u16 = 0; //The Index Register is a special register used to store memory addresses for use in operations.
  //It’s a 16-bit register because the maximum memory address (0xFFF) is too big for an 8-bit register.
  dt: u8 = 0; //The CHIP-8 has a simple timer used for timing. If the timer value is zero, it stays zero.
  //If it is loaded with a value, it will decrement at a rate of 60Hz.

  // what the current pressed button is
  key: string = "";

  //The stack is an array of 16 16-bit values, used to store the address that the interpreter
  //shoud return to when finished with a subroutine. Chip-8 allows for up to 16 levels of nested subroutines.
  Stack: Uint16Array = new Uint16Array(16);

  memory: Memory = new Memory();

  //Tentatively trying out this approach, because we only need 1 bit per pixel (32x64 pixels = 2048 bits = 256 bytes)
  display: Display = new Display();
  soundHandler: boolean = false; //This is temporary since we haven't made the SoundHandler object yet

  //Instruction variable to hold current instruction bits (16) for decode and execute:
  CurrInstruction: u16 = 0;

  //Variables needed for instruction decode function:
  nnn: u16 = 0; //A 12-bit value, the lowest 12 bits of the instruction
  n: u8 = 0; //A 4-bit value, the lowest 4 bits of the instruction
  x: u8 = 0; //A 4-bit value, the lower 4 bits of the high byte of the instruction
  y: u8 = 0; //A 4-bit value, the upper 4 bits of the low byte of the instruction
  kk: u8 = 0; //An 8-bit value, the lowest 8 bits of the instruction
  i: u8 = 0; //the first 4 bitys of an instruction
  st: number = 0; // sound timer register

  time: i32 = 0;

  //Constructor and Functions
  constructor(memToLoad: number, displayOutput: number, handleSound: number) {
    //Instantiate values with the reset function
    this.reset();

    this.display.loadMemRef(this.memory);

    //Call starter functions
    // this.loadMemory(memToLoad);
    // this.loadDisplay(displayOutput);
    // this.loadSound(handleSound);
  }

  reset(): void {
    //Clear registers:
    for (let i = 0; i < 16; i++) {
      this.V[i] = 0;
    }
    //Reset Psuedo-Registers
    this.pc = 0x200;
    this.sp = 0;
    this.index = 0;
    this.dt = 0;
    this.st = 0;

    //Clear stack:
    for (let j = 0; j < 16; j++) {
      this.Stack[j] = 0;
    }

    // reset display
    this.display.clearDisplay();

    //reset decode variables:
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
    //For fetching the instruction we will need to store the bits stored in memory at location PC: Mem[PC]
    //then we will need to shift those bits to the left by 8 places (memory is 8 bits an address) since this is only half of the instruction.
    //Then we OR equals the bits stored in PC+1 which combines the two halves of the instruction into our CurrInstruction variable.
    //Then we need to set PC to the next instruction for execution.
    this.CurrInstruction = this.memory.read(this.pc) << 8;
    this.CurrInstruction |= this.memory.read(this.pc + 1);
    this.pc += 2;
  }

  decodeTable_func(inst: u16): void {
    this.nnn = inst & 0x0fff; //gets last 12 instruction bits (0 through 11)
    this.n = u8(inst & 0x000f); //gets last 4 instruction bits (0 through 3)
    this.x = u8((inst >> 8) & 0x000f); //gets instruction bits 8 through 11 (shifts 8 places to get them back to LSB)
    this.y = u8((inst >> 4) & 0x000f); //gets instruction bits 4 through 7 (shifts 4 places to get them back to LSB)
    this.kk = u8(inst & 0x00ff); //gets last 8 instruction bits (0 through 7)
    this.i = u8((inst >> 12) & 0x000f); // gets first 4 bits of instruction

    if (inst == 0) {
      return;
    }

    if (this.i == 0x0) {
      if (this.nnn == 0x0e0) {
        this.CLS();
      } else if (this.nnn == 0x0ee) {
        this.RET();
      } else {
        this.SYS();
      }
    } else if (this.i == 0x1) {
      this.JPimm();
    } else if (this.i == 0x2) {
      this.CALL();
    } else if (this.i == 0x3) {
      this.SEbyte();
    } else if (this.i == 0x4) {
      this.SNEbyte();
    } else if (this.i == 0x5) {
      this.SKP();
    } else if (this.i == 0x6) {
      this.LDbyte();
    } else if (this.i == 0x7) {
      this.ADDbyte();
    } else if (this.i == 0x8) {
      if (this.n == 0x0) {
        this.LDregister();
      }
      if (this.n == 0x1) {
        this.OR();
      }
      if (this.n == 0x2) {
        this.AND();
      }
      if (this.n == 0x3) {
        this.XOR();
      }
      if (this.n == 0x4) {
        this.ADDregister();
      }
      if (this.n == 0x5) {
        this.SUB();
      }
      if (this.n == 0x6) {
        this.SHR();
      }
      if (this.n == 0x7) {
        this.SUBN();
      }
      if (this.n == 0xe) {
        this.SHL();
      }

      if (this.n == 0x8) {
        console.log("here");
        this.DRAW_PIXEL();
      }
    } else if (this.i == 0x9) {
      this.SNEregister();
    } else if (this.i == 0xa) {
      this.LDindex();
    } else if (this.i == 0xb) {
      this.JPregister();
    } else if (this.i == 0xc) {
      this.RND();
    } else if (this.i == 0xd) {
      this.DRW();
    } else if (this.i == 0xe) {
      if (this.kk == 0x9e) {
        this.SKP();
      } else if (this.kk == 0xa1) {
        this.SKNP();
      }
    } else if (this.i == 0xf) {
      if (this.kk == 0x07) {
        this.LDret();
      } else if (this.kk == 0x0a) {
        this.LDkey();
      } else if (this.kk == 0x15) {
        this.LDter();
      } else if (this.kk == 0x18) {
        this.LDser();
      } else if (this.kk == 0x1e) {
        this.ADDindex();
      } else if (this.kk == 0x29) {
        this.LDsprite();
      } else if (this.kk == 0x33) {
        this.LDbr();
      } else if (this.kk == 0x55) {
        this.LDmemWr();
      } else if (this.kk == 0x65) {
        this.LDmemRd();
      }
    }
  }

  // decodeTable = [
  //   { "0xe0": this.CLS, "0xee": this.RET, nibbles: 2 }, //we can't have numbers as json keys,
  //   this.JPimm,
  //   this.CALL,
  //   this.SEbyte,
  //   this.SNEbyte,
  //   { "0": this.SEregister, nibbles: 1 },
  //   this.LDbyte,
  //   this.ADDbyte,
  //   {
  //     "0": this.LDregister,
  //     "1": this.OR,
  //     "2": this.AND,
  //     "3": this.XOR,
  //     "4": this.ADDregister,
  //     "5": this.SUB,
  //     "6": this.SHR,
  //     "7": this.SUBN,
  //     "0xe": this.SHL,
  //     nibbles: 1,
  //   }, //Object type for further decode
  //   { "0": this.SNEregister, nibbles: 1 }, //Object type for further decode
  //   this.LDindex,
  //   this.JPregister,
  //   this.RND,
  //   this.DRW,
  //   { "0x9e": this.SKP, "0xa1": this.SKNP, nibbles: 2 }, //Object type for further decode
  //   {
  //     "0x07": this.LDret,
  //     "0x0a": this.LDkey,
  //     "0x15": this.LDter,
  //     "0x18": this.LDser,
  //     "0x1e": this.ADDindex,
  //     "0x29": this.LDsprite,
  //     "0x33": this.LDbr,
  //     "0x55": this.LDmemWr,
  //     "0x65": this.LDmemRd,
  //     nibbles: 2,
  //   }, //Object type for further decode
  // ];

  IRDecode(instruction: u16): void {
    //For now my idea is to first decode every instruction the same way using bit masks with the special decode variables I created like so:
    // this.nnn = instruction & 0x0fff; //gets last 12 instruction bits (0 through 11)
    // this.n = instruction & 0x000f; //gets last 4 instruction bits (0 through 3)
    // this.x = (instruction & 0x0f00) >> 8; //gets instruction bits 8 through 11 (shifts 8 places to get them back to LSB)
    // this.y = (instruction & 0x00f0) >> 4; //gets instruction bits 4 through 7 (shifts 4 places to get them back to LSB)
    // this.kk = instruction & 0x00ff; //gets last 8 instruction bits (0 through 7)

    //Above this I have an array of function pointers, and then based on specific op code we call that function pointer.

    //Get the return value from decodeTable using the value found from instruction bits: 12 through 15
    // let decodeOne = this.decodeTable[`${instruction & (0xf000 >> 12)}`]();

    //Now we check the return type from decode table:
    //If return type is a function, great we return and execute that function
    //If it is not a function but an object, then we need to decode a lil further

    // if (typeof decodeOne === "function") {
    //   return decodeOne;
    // }
    this.decodeTable_func(instruction);
  }

  //CPU Instructions for Execution:

  SYS(): void {
    //This instruction is only used on the old computers on which Chip-8 was originally implemented. It is ignored by modern interpreters.
    console.log("Error: Cannot call SYS() function!");
  }

  CLS(): void {
    //Clear the display.
    this.display.clearDisplay();
  }

  RET(): void {
    //The interpreter sets the program counter to the address at the top of the stack, then subtracts 1 from the stack pointer.
    if (this.sp >= 0) {
      this.sp--;
    } else {
      console.log("Error: tried to decrement SP below 0");
    }
    this.pc = this.Stack[this.sp];
  }

  JPimm(): void {
    //The interpreter sets the program counter to nnn.
    this.pc = this.nnn;
  }

  DRAW_PIXEL(): void {
    //The interpreter sets the program counter to nnn.
    console.log(this.x.toString());
    console.log(this.y.toString());

    this.display.draw_pixel(this.x, this.y);
  }

  CALL(): void {
    //The interpreter increments the stack pointer, then puts the current PC on the top of the stack. The PC is then set to nnn.
    this.Stack[this.sp] = this.pc;
    if (this.sp === 15) {
      console.log("Error: Cannot increment Stack to value greater than 15");
    } else {
      this.sp++;
    }

    this.pc = this.nnn;
  }

  SEbyte(): void {
    //The interpreter compares register Vx to kk, and if they are equal, increments the program counter by 2.
    if (this.V[this.x] === this.kk) {
      this.pc += 2;
    }
  }

  SNEbyte(): void {
    //The interpreter compares register Vx to kk, and if they are NOT equal, increments the program counter by 2.
    if (this.V[this.x] != this.kk) {
      this.pc += 2;
    }
  }

  SEregister(): void {
    //The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
    if (this.V[this.x] === this.V[this.y]) {
      this.pc += 2;
    }
  }

  LDbyte(): void {
    //The interpreter puts the value kk into register Vx.
    this.V[this.x] = this.kk;
  }

  ADDbyte(): void {
    //Adds the value kk to the value of register Vx, then stores the result in Vx.
    this.V[this.x] += this.kk;
  }

  LDregister(): void {
    //Stores the value of register Vy in register Vx.
    this.V[this.x] = this.V[this.y];
  }

  OR(): void {
    //Performs a bitwise OR on the values of Vx and Vy, then stores the result in Vx.
    //A bitwise OR compares the corrseponding bits from two values, and if either bit is 1,
    //then the same bit in the result is also 1. Otherwise, it is 0.
    this.V[this.x] |= this.V[this.y];
  }

  AND(): void {
    //Performs a bitwise AND on the values of Vx and Vy, then stores the result in Vx.
    //A bitwise AND compares the corrseponding bits from two values, and if both bits are 1,
    //then the same bit in the result is also 1. Otherwise, it is 0.
    this.V[this.x] &= this.V[this.y];
  }

  XOR(): void {
    //Performs a bitwise exclusive OR on the values of Vx and Vy, then stores the result in Vx.
    //An exclusive OR compares the corrseponding bits from two values, and if the bits are not both the same,
    //then the corresponding bit in the result is set to 1. Otherwise, it is 0.

    this.V[this.x] ^= this.V[this.y];
  }

  ADDregister(): void {
    //The values of Vx and Vy are added together.
    //If the result is greater than 8 bits (i.e., > 255,) VF is set to 1, otherwise 0.
    //Only the lowest 8 bits of the result are kept, and stored in Vx.
    this.V[0xf] = 0;
    let value = this.V[this.x] + this.V[this.y];
    if (value > 255) {
      this.V[0xf] = 1;
      value &= 0xff;
    }
    this.V[this.x] = value;
  }

  SUB(): void {
    //If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.
    this.V[0xf] = 0;
    if (this.V[this.x] > this.V[this.y]) {
      this.V[0xf] = 1;
    }
    this.V[this.x] -= this.V[this.y];
  }

  SHR(): void {
    //If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2.
    let overflow = this.V[this.x] % 2;
    this.V[0xf] = overflow;
    this.V[this.x] = this.V[this.x] >> 1;
  }

  SUBN(): void {
    //If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx.
    this.V[0xf] = 0;
    if (this.V[this.y] > this.V[this.x]) {
      this.V[0xf] = 1;
    }
    this.V[this.x] = this.V[this.y] - this.V[this.x];
  }

  SHL(): void {
    //If the most-significant bit of Vx is 1, then VF is set to 1, otherwise to 0. Then Vx is multiplied by 2.
    let checker = this.V[this.x] >> 7; //moves MSB to LSB place
    this.V[0xf] = checker;
    this.V[this.x] = this.V[this.x] << 1;
  }

  SNEregister(): void {
    //The values of Vx and Vy are compared, and if they are not equal, the program counter is increased by 2.
    if (this.V[this.x] != this.V[this.y]) {
      this.pc += 2;
    }
  }

  LDindex(): void {
    //The value of register I is set to nnn.
    this.index = this.nnn;
  }

  JPregister(): void {
    //The program counter is set to nnn plus the value of V0.
    this.pc = this.nnn + this.V[0];
  }

  RND(): void {
    //The interpreter generates a random number from 0 to 255, which is then ANDed with the value kk.
    //The results are stored in Vx.
    let randFloat: f64 = Math.floor(Math.random() * 256);
    let randInt: u8 = <u8>randFloat; //TypeCasting f64 -> u8

    this.V[this.x] = randInt & this.kk;
  }

  DRW(): void {
    //The interpreter reads n bytes from memory, starting at the address stored in I.
    //These bytes are then displayed as sprites on screen at coordinates (Vx, Vy).
    //Sprites are XORed onto the existing screen. If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0.
    //If the sprite is positioned so part of it is outside the coordinates of the display, it wraps around to the opposite side of the screen.
    this.display.drawSprite(this.V[this.x], this.V[this.y], this.index, this.n);
    this.V[0xf] = this.display.getCollisionValue();
  }

  SKP(): void {
    //Checks the keyboard, and if the key corresponding to the value of Vx is currently in the down position, PC is increased by 2.
    //Still discussing how the keyboard will be implemented for this project
  }

  SKNP(): void {
    //Checks the keyboard, and if the key corresponding to the value of Vx is currently in the up position, PC is increased by 2.
    //cant be implemented without keyboard
  }

  LDret(): void {
    //The value of DT is placed into Vx.
    this.V[this.x] = this.dt;
  }

  LDkey(): void {
    //All execution stops until a key is pressed, then the value of that key is stored in Vx.
    //cant be implemented without keyboard
  }

  LDter(): void {
    //DT is set equal to the value of Vx.
    this.dt = this.V[this.x];
  }

  LDser(): void {
    //ST is set equal to the value of Vx.
    //cant be implemented without sound handler
  }

  ADDindex(): void {
    //The values of I and Vx are added, and the results are stored in I.
    this.index += this.V[this.x];
  }

  LDsprite(): void {
    //The value of I is set to the location for the hexadecimal sprite corresponding to the value of Vx.
    //Take value in Vx and multiply by 5 (for 5 bytes of each Font)
    this.index = this.V[this.x] * 5;
  }

  LDbr(): void {
    //The interpreter takes the decimal value of Vx, and places the hundreds digit in memory at location in I,
    //the tens digit at location I+1, and the ones digit at location I+2.

    let bcd = this.V[this.x];
    this.memory.write(this.index, bcd / 100); //writes hundreds place into memory at address: Index
    bcd /= 10; //removes ones place
    bcd %= 10; //Singles out tens place;
    this.memory.write(this.index + 1, bcd); //writes tens place into memory at address: index + 1
    bcd = this.V[this.x];
    bcd %= 10; //singles out ones place;
    this.memory.write(this.index + 2, bcd); // writes ones place into memory at address: index + 2
  }

  LDmemWr(): void {
    //The interpreter copies the values of registers V0 through Vx into memory, starting at the address in I.
    for (let i: u8 = 0; i <= this.x; i++) {
      this.memory.write(this.index + i, this.V[i]);
    }
  }

  LDmemRd(): void {
    //The interpreter reads values from memory starting at location I into registers V0 through Vx.
    for (let i: u8 = 0; i <= this.x; i++) {
      this.V[i] = this.memory.read(this.index + i);
    }
  }

  tick(): void {
    const load =
      (u16(this.memory.read(this.pc)) << 8) | this.memory.read(this.pc + 1);
    this.pc += 2;
    this.IRDecode(load);
  }
}

/**/
// start defining the high level API for the CPU here
/**/

const cpu = new CPU(0, 0, 0);

export function read_instruction(inp: u16): void {
  cpu.IRDecode(inp);
}

export function read_all_registers(): Uint16Array {
  let out: Uint16Array = new Uint16Array(37);
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
  out[36] = cpu.key.length ? cpu.key.charCodeAt(0) : 0x0;
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

export function set_key(key_in: string): void {
  cpu.key = key_in;
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
