


## What is this? 

This folder has AssemblyScript source files that define the emulator.  


## How to run?
- `yarn install`
- `yarn run asbuild`

It will then copy the WASM binaries into the frontend, and if the frontend is 
already running, it'll refresh to use the new WASM binaries. 

## API Breakdown
sv8's emulator exposes the following API:
- `display(): Uint8Array` returns the current display buffer.
- `load_rom(rom: Uint8Array): void` copies the bytes in `rom` starting from address 
512 in RAM.
- `read_mem(add: u16): u8` returns the data in a single address in RAM `add`.
- `tick(): u16` will decode the bytes in the program counter (pc) and pc + 1 
(instructions are two bytes), run the instruction, and returns the new pc. 
- `reset(): void` resets the CPU, which includes wiping the display, zero-ing the registers, 
and clearing out RAM. 
- `ram_dump(): Uint8Array` returns a copy of the entire RAM of the emulator. 
- `set_key_array(key_in: Array<u8>): void` updates the pseudo-register describing the 
keys being pressed to match `key_in`, an array of which button on the original Chip-8 
hex keypad is currently being pressed. 
- `decrement_timers(): void` meant to be ran 60 times a second, decrements the sound 
timer and the delay timer by 1 with a floor of 0. 
- `convert_inst_to_string(inst: u16): string` converts a 2 byte instruction to an 
English representation of the instruction. 