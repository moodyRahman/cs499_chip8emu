//Memory class
class Memory {
  //4,096 bytes of RAM
  mem: Uint8Array = new Uint8Array(4096);
  //Locations 0x000 through 0x1FF should not be used by programs

  //Constructor and Functions
  constructor() {
    this.clear();
  }

  clear(): void {
    //set all entries in Memory to 0
    for (let i = 0; i < 4096; i++) {
      this.mem[i] = 0;
    }
  }

  read(address: number): u8 {
    //get the entry stored in Memory at address provided
    //ensure that the address does not overflow by only taking in the last 12 bits of the address parameter
    return this.mem[address & 0xfff];
  }

  write(address: number, value: number): void {
    //store an entry in Memory at address provided
    //ensure that the address does not overflow by only taking in the last 12 bits of the address parameter
    //Value provided as parameter should only fit into one byte of space
    this.mem[address & 0xfff] = value & 0xff;
  }

  //Font function should implement by Thursday

  //Load ROM function
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

  //The stack is an array of 16 16-bit values, used to store the address that the interpreter
  //shoud return to when finished with a subroutine. Chip-8 allows for up to 16 levels of nested subroutines.
  Stack: Uint16Array = new Uint16Array(16);

  memory: Memory = new Memory();

  display: boolean = false; //This is temporary since we haven't made the Display object yet
  soundHandler: boolean = false; //This is temporary since we haven't made the SoundHandler object yet

  //Instruction variable to hold current instruction bits (16) for decode and execute:
  CurrInstruction: u16 = 0;

  //Variables needed for instruction decode function:
  nnn: u16 = 0; //A 12-bit value, the lowest 12 bits of the instruction
  n: u8 = 0; //A 4-bit value, the lowest 4 bits of the instruction
  x: u8 = 0; //A 4-bit value, the lower 4 bits of the high byte of the instruction
  y: u8 = 0; //A 4-bit value, the upper 4 bits of the low byte of the instruction
  kk: u8 = 0; //An 8-bit value, the lowest 8 bits of the instruction
  st: number = 0; // sound timer register

  time: i32 = 0;

  //Constructor and Functions
  constructor(memToLoad: any, displayOutput: any, handleSound: any) {
    //Instantiate values with the reset function
    this.reset();

    //Call starter functions
    this.loadMemory(memToLoad);
    this.loadDisplay(displayOutput);
    this.loadSound(handleSound);
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

    //reset decode variables:
    this.nnn = 0;
    this.n = 0;
    this.x = 0;
    this.y = 0;
    this.kk = 0;
  }

  loadMemory(memoryToLoad: any): void {
    this.memory = memoryToLoad;
  }

  loadDisplay(displayToLoad: any): void {
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
    this.CurrInstruction = this.memory.read(this.pc) >> 8;
    this.CurrInstruction |= this.memory.read(this.pc + 1);
    this.pc += 2;
  }

  decodeTable: any[] = [
    // { 0xe0: this.CLS, 0xee: this.RET, nibbles: 2 }, //Object type for further decode
    { "0xe0": this.CLS, "0xee": this.RET, nibbles: 2 }, //we can't have numbers as json keys,
    // TODO: lets talk about how to deal with this, maybe if we enforce all numbers to be in hex, we can just cast them to strings and proceed
    this.JPimm,
    this.CALL,
    this.SEbyte,
    this.SNEbyte,
    { "0": this.SEregister, nibbles: 1 },
    this.LDbyte,
    this.ADDbyte,
    {
      "0": this.LDregister,
      "1": this.OR,
      "2": this.AND,
      "3": this.XOR,
      "4": this.ADDregister,
      "5": this.SUB,
      "6": this.SHR,
      "7": this.SUBN,
      "0xe": this.SHL,
      nibbles: 1,
    }, //Object type for further decode
    { "0": this.SNEregister, nibbles: 1 }, //Object type for further decode
    this.LDindex,
    this.JPregister,
    this.RND,
    this.DRW,
    { "0x9e": this.SKP, "0xa1": this.SKNP, nibbles: 2 }, //Object type for further decode
    {
      "0x07": this.LDret,
      "0x0a": this.LDkey,
      "0x15": this.LDter,
      "0x18": this.LDser,
      "0x1e": this.ADDindex,
      "0x29": this.LDsprite,
      "0x33": this.LDbr,
      "0x55": this.LDmemWr,
      "0x65": this.LDmemRd,
      nibbles: 2,
    }, //Object type for further decode
  ];

  IRDecode(instruction: any): funcref {
    //For now my idea is to first decode every instruction the same way using bit masks with the special decode variables I created like so:
    this.nnn = instruction & 0x0fff; //gets last 12 instruction bits (0 through 11)
    this.n = instruction & 0x000f; //gets last 4 instruction bits (0 through 3)
    this.x = (instruction & 0x0f00) >> 8; //gets instruction bits 8 through 11 (shifts 8 places to get them back to LSB)
    this.y = (instruction & 0x00f0) >> 4; //gets instruction bits 4 through 7 (shifts 4 places to get them back to LSB)
    this.kk = instruction & 0x00ff; //gets last 8 instruction bits (0 through 7)

    //Above this I have an array of function pointers, and then based on specific op code we call that function pointer.

    //Get the return value from decodeTable using the value found from instruction bits: 12 through 15
    let decodeOne = this.decodeTable[instruction & (0xf000 >> 12)];

    //Now we check the return type from decode table:
    //If return type is a function, great we return and execute that function
    //If it is not a function but an object, then we need to decode a lil further
    if (typeof decodeOne === "function") {
      return decodeOne;
    }
    return () => {};
  }

  //CPU Instructions for Execution:

  SYS(): void {
    //This instruction is only used on the old computers on which Chip-8 was originally implemented. It is ignored by modern interpreters.
    console.log("Error: Cannot call SYS() function!");
  }

  CLS(): void {
    //Clear the display.
    //this.display.clear();
  }

  RET(): void {
    //The interpreter sets the program counter to the address at the top of the stack, then subtracts 1 from the stack pointer.
    if (this.sp >= 0) {
      this.sp--;
    } else {
      console.log("Error: tried to decrement SP below 0");
    }
    this.pc = this.sp;
  }

  JPimm(): void {
    //The interpreter sets the program counter to nnn.
    this.pc = this.nnn;
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
    //The results are stored in Vx. See instruction 8xy2 for more information on AND.
    //Need to figure out how generating random numbers work in AssemblyScript
  }

  DRW(): void {
    //The interpreter reads n bytes from memory, starting at the address stored in I.
    //These bytes are then displayed as sprites on screen at coordinates (Vx, Vy).
    //Sprites are XORed onto the existing screen. If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0.
    //If the sprite is positioned so part of it is outside the coordinates of the display, it wraps around to the opposite side of the screen.
    //Can't be implemented at the moment since no Display class implemented
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
    //Cant be implemented without display class
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
    for (let i = 0; i <= this.x; i++) {
      this.memory.write(this.index + i, this.V[i]);
    }
  }

  LDmemRd(): void {
    //The interpreter reads values from memory starting at location I into registers V0 through Vx.
    for (let i = 0; i <= this.x; i++) {
      this.V[i] = this.memory.read(this.index + i);
    }
  }
}
