//import { read_display, draw, buffer } from "./display";


//Memory class
class Memory{
    
  //4,096 bytes of RAM 
  mem: Uint8Array = new Uint8Array(4096);
  //Locations 0x000 through 0x1FF should not be used by programs

  //Constructor and Functions
  constructor(){
      this.clear();
  }

  clear(){
      //set all entries in Memory to 0
      for(let i = 0; i < 4096; i++){
          this.mem[i] = 0;
      }
  }

  read(address){
      //get the entry stored in Memory at address provided
      //ensure that the address does not overflow by only taking in the last 12 bits of the address parameter
      return (this.mem[address & 0xFFF]);
  }

  write(address, value){
      //store an entry in Memory at address provided
      //ensure that the address does not overflow by only taking in the last 12 bits of the address parameter
      //Value provided as parameter should only fit into one byte of space
      this.mem[address & 0xFFF] = (value & 0xFF);
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

  //ram: Array<i32> = new Array<i32>(20);
  //rom: Array<string> = new Array<string>(1024);
  
  time: i32 = 0;

  //Constructor and Functions
  constructor(memToLoad, displayOutput, handleSound) {
    //Instantiate values with the reset function
    this.reset()
    
    //Call starter functions
    this.loadMemory(memToLoad);
    this.loadDisplay(displayOutput);
    this.loadSound(handleSound);
  }

  tick(): number {
    this.time++;
    return this.time;
  }

  reset(){
    //Clear registers:
    for(let i = 0; i < 16; i++){
      this.V[i] = 0;
    }
    //Reset Psuedo-Registers
    this.pc = 0x200;
    this.sp = 0;
  
    //Clear stack:
    for(let j = 0; j < 16; j++){
      this.Stack[j] = 0;
    }

    //reset decode variables:
    this.nnn = 0;
    this.n = 0;
    this.x = 0;
    this.y = 0;
    this.kk = 0;

  }

  loadMemory(memoryToLoad){
    this.memory = memoryToLoad;
  }

  loadDisplay(displayToLoad){
    this.display = displayToLoad;
  }

  loadSound(soundToLoad){
    this.soundHandler = soundToLoad;
  }

  IRFetch(){
    //For fetching the instruction we will need to store the bits stored in memory at location PC: Mem[PC]
    //then we will need to shift those bits to the left by 8 places (memory is 8 bits an address) since this is only half of the instruction.
    //Then we OR equals the bits stored in PC+1 which combines the two halves of the instruction into our CurrInstruction variable.
    //Then we need to set PC to the next instruction for execution.
    this.CurrInstruction = (this.memory.read(this.pc) >> 8);
    this.CurrInstruction |= (this.memory.read(this.pc + 1));
    this.pc += 2;
  }

  IRDecode(instruction){
    //This I am still trying to figure out how to do.
    //For now my idea is to first decode every instruction the same way using bit masks with the special decode variables I created like so:
    this.nnn = instruction & 0x0FFF; //gets last 12 instruction bits (0 through 11)
    this.n = instruction & 0x000F; //gets last 4 instruction bits (0 through 3)
    this.x = (instruction & 0x0F00) >> 8; //gets instruction bits 8 through 11 (shifts 8 places to get them back to LSB)
    this.y = (instruction & 0x00F0) >> 4; //gets instruction bits 4 through 7 (shifts 4 places to get them back to LSB)
    this.kk = instruction & 0x00FF; //gets last 8 instruction bits (0 through 7)

    //Then above this decode function I will have an array of function pointers, and then based on specific op code we call that function pointer.

    //I'll have if/elif/else calls to ensure that based on the decoded instruction and the opcode, we call the correct function pointer from our array.

    //So far I see a pattern with the instruction types and therefore 4 possibilities can occur:
    // 1. Some instructions just need the opcode to execute, so we check that and execute the correct function (CLS or RET)
    // 2. Other instructions have one nibble they are dependent on so if we find that to be the case, then further decode will be needed
    // 3. Some have 2 nibbles they are dependent on so we decode further for that
    // 4. Finally we have an instruction with 3 nibble dependencies so we will need to decode further for that 
    
  }


  //CPU Instructions for Execution:

  SYS(){ //This instruction is only used on the old computers on which Chip-8 was originally implemented. It is ignored by modern interpreters.
    console.log("Error: Cannot call SYS() function!")
  }

  CLS(){ //Clear the display.
    //this.display.clear();
  }

  RET(){ //The interpreter sets the program counter to the address at the top of the stack, then subtracts 1 from the stack pointer.
    if(this.sp >= 0){
      this.sp--;
    }else{
      console.log("Error: tried to decrement SP below 0");
    }
    this.pc = this.sp;
  }

  JP(){ //The interpreter sets the program counter to nnn.
    this.pc = this.nnn;
  }

  CALL(){ //The interpreter increments the stack pointer, then puts the current PC on the top of the stack. The PC is then set to nnn.
    this.Stack[this.sp] = this.pc;
    if(this.sp === 15){
      console.log("Error: Cannot increment Stack to value greater than 15");
    }else{
      this.sp++;
    }

    this.pc = this.nnn;
  }

  SEbyte(){ //The interpreter compares register Vx to kk, and if they are equal, increments the program counter by 2.
    if(this.V[this.x] === this.kk){
      this.pc += 2;
    }
  }

  SNE(){ //The interpreter compares register Vx to kk, and if they are NOT equal, increments the program counter by 2.
    if(this.V[this.x] != this.kk){
      this.pc += 2;
    }
  }

  SEregister(){ //The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
    if(this.V[this.x] === this.V[this.y]){
      this.pc += 2;
    }
  }

  LDbyte(){ //The interpreter puts the value kk into register Vx.
    this.V[this.x] = this.kk;
  }

  ADDbyte(){ //Adds the value kk to the value of register Vx, then stores the result in Vx.
    this.V[this.x] += this.kk;
  }

  LDregister(){ //Stores the value of register Vy in register Vx.
    this.V[this.x] = this.V[this.y];
  }

  OR(){ //Performs a bitwise OR on the values of Vx and Vy, then stores the result in Vx. 
        //A bitwise OR compares the corrseponding bits from two values, and if either bit is 1, 
        //then the same bit in the result is also 1. Otherwise, it is 0.
    this.V[this.x] |= this.V[this.y];
  }

  AND(){ //Performs a bitwise AND on the values of Vx and Vy, then stores the result in Vx. 
         //A bitwise AND compares the corrseponding bits from two values, and if both bits are 1, 
         //then the same bit in the result is also 1. Otherwise, it is 0.
    this.V[this.x] &= this.V[this.y];

  }

  XOR(){ //Performs a bitwise exclusive OR on the values of Vx and Vy, then stores the result in Vx. 
         //An exclusive OR compares the corrseponding bits from two values, and if the bits are not both the same, 
         //then the corresponding bit in the result is set to 1. Otherwise, it is 0.


    //Still not sure how to do XOR in AssemblyScript
  }

  ADDregister(){ //The values of Vx and Vy are added together. 
                 //If the result is greater than 8 bits (i.e., > 255,) VF is set to 1, otherwise 0. 
                 //Only the lowest 8 bits of the result are kept, and stored in Vx.
    this.V[0xF] = 0;
    let value = this.V[this.x] + this.V[this.y];
    if(value > 255){
      this.V[0xF] = 1;
      value &= 0xFF;
    }
    this.V[this.x] = value;
  }

  SUBregister(){ //If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.
    this.V[0xF] = 0;
    if(this.V[this.x] > this.V[this.y]){
      this.V[0xF] = 1;
    }
    this.V[this.x] -= this.V[this.y];
  }

  SHR(){ //If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2.
    let overflow = this.V[this.x] % 2;
    this.V[0xF] = overflow;
    this.V[this.x] /= 2;
  }

}











/*
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

export { cpu };
*/
