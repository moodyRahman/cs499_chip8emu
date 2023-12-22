


## What is this? 

Frontend Svelte code that handles emulation I/O 


## How to run?
- first make sure you've compiled the emulator before you run the frontend! follow emulator instructions
- `yarn install`
- `yarn dev`


## Code Structure
The best place to start reading to understand the structure of the frontend is 
`frontend/src/routes/+page.svelte`, which contains the high level structure of 
sv8. From there you can view the source code for each component to best understand 
the nuances of the implementation. 

## Components
- `Display` will get a length 256 UInt8Array from the emulator whenever the 
`display_trigger` store recieves an update. Each UInt8 represents 8 monochrome pixels, 
which is rendered via `Octet` which renders each individual pixel via `Pixel`. 
- `Registers` is a unique component because it always renders, regardless of `debug_state`. 
The component itself will choose what parts of it are visible. This behavior is because 
the code to handle audio is implemented here to minimize potential latency if we were to 
propogate that state via a store. This means that `Registers` always need to be rendered 
so that we can read the audio state of the emulator. 
- `SpriteDesigner` is a debug component that allows the user to design sprites and 
program with them. 
- `RomDump` is what handles the CPU timing as well as the conditional display of the 
source ROM bytes. It works via a reactive global `setInterval` thread that's always checking 
the emulator state and queues up several CPU ticks if the CPU state is active. 
- `Loader` makes a request to the backend upon initial page load to query what ROMS 
are available to play, and displays that to the user. It also decodes ROMS from the backend 
and loads them into the emulator. 
- `MessageBoard` reads metadata about the currently loaded ROM, displays the keyboard 
controls, and which key is currently pressed. 
- `GamePad` implements the keyboard listeners. 
- `Editor` is the text window that allows the user to write source code and assemble it 
to be ran in the emulator. 