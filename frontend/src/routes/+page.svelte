

<script lang="ts">

    import * as chip8 from "$lib/chip8/debug.js";
	import Octet from "../components/Octet.svelte";
    import { onMount } from 'svelte';


    const bindFunc = (wasmfunc: CallableFunction) => {    
        return {
            func: (_trigger: number) => {  
                return wasmfunc()
            },
            trigger: 0
        }
    }

    
    let arbitrary_inst = ""
    let px = 0;
    let py = 0;
    let rom_name = ""
    let rom = new Uint8Array()

    let rom_disassem = new Uint16Array();

    (async () => {
        const res = await fetch("http://localhost:3000/assets/roms/SpaceInvaders.ch8");
        const buff = await res.arrayBuffer();
        rom = new Uint8Array(buff);
        chip8.load_rom(rom);

        const padded_rom = new Uint8Array(buff.byteLength%2 == 0? buff.byteLength:buff.byteLength + 1);

        
        padded_rom.set(rom, 0);
        

        rom_disassem = new Uint16Array(padded_rom.buffer);

        console.log(rom_disassem.slice(0, 10))
	})()


    const swap_endian = (x: number) => {

    }



    let {func: read_instruction, trigger: read_instruction_trigger} = bindFunc(() => {
        const out = chip8.read_instruction(Number(arbitrary_inst)); 
        read_all_registers_trigger++; 
        return out
    })    
    $: read_instruction(read_instruction_trigger)


    let {func: read_all_registers, trigger: read_all_registers_trigger} = bindFunc(() => {return chip8.read_all_registers()})
    $: read_all_registers(read_all_registers_trigger)

    let {func: read_display, trigger: read_display_trigger} = bindFunc(chip8.display);
    
</script>



<div>
    <div class="registers">
    {#each read_all_registers(read_all_registers_trigger) as register, i}
        <span class="register">V{i},{register.toString(16)}  </span>
    {/each}
    </div>
</div>

<div>
    <input type="text" placeholder="enter instruction here" bind:value={arbitrary_inst}>
</div>

<div>
    <button on:click={() => { read_instruction_trigger++; read_display_trigger++; console.log(chip8.convert_inst_to_string(Number(arbitrary_inst)))}}>run the instruction</button>
</div>

<div>
    
<pre>
    a good instruction to run is:
    0x
    6  opcode for LD, puts values kk into register Vx
    1  x, the register we'll put kk into
    20 kk, the value we'll put into register Vx
    
    (read as 0x6120, it's been split up to accomodate annotations)
</pre>

<pre>

    draw pixel at (0 to 16, 0 to 16):
    0x
    8  opcode for a bunch of different things
    0  x, x-coordinate 
    0  y, y-coordinate
    8  n, further opcode for a temporary debug draw pixel function
    
    (read as 0x8008)
</pre>
</div>

<div>
    <div>
        load a rom
    </div>
    <select bind:value={rom_name}>

        <!-- Astrododge.ch8  Breakout.ch8  Landing.ch8  Pong.ch8  Pong2.ch8  SpaceInvaders.ch8  Tetris.ch8  TicTacToe.ch8 -->
        <option value="Astrododge.ch8">Astrododge</option>
        <option value="Breakout.ch8">Breakout</option>
        <option value="Landing.ch8">Landing</option>
        <option value="Pong.ch8">Pong</option>
        <option value="Pong2.ch8">Pong2</option>
        <option value="SpaceInvaders.ch8">SpaceInvaders</option>
        <option value="Tetris.ch8">Tetris</option>
        <option value="TicTacToe.ch8">TicTacToe</option>

    </select>
</div>
<div class="lr-container">
    <div class="display-container">
        
        {#each read_display(read_display_trigger) as pixel_group }
        
        <Octet data={pixel_group} />
        
        {/each}
    </div>
    <div>
        {#each rom_disassem.slice(0, 30) as inst}
        <!-- {((inst>>8) | (inst<<8))} aa {chip8.convert_inst_to_string(((inst>>8) | (inst<<8)))} <br>  -->
            {chip8.convert_inst_to_string((inst & 0x00ff) << 8 | (inst>>8))}<br> 

        {/each}
    </div>
</div>

<div>
    <button on:click={() => { chip8.debug_set_pixel(px, py); read_display_trigger++;}} >draw pixel</button>
    <!-- <button on:click={() => { read_display_trigger++}} >update display</button> -->

</div>


<div>
    draw pixels: <input type="number" bind:value={px} placeholder="x"> <input type="number" bind:value={py} placeholder="y">
</div>


<style>

    :global(html) {
    box-sizing: border-box;
    }
    *, *:before, *:after {
    box-sizing: inherit;
    }


    .registers {
        width: 50%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
    .register {
        margin-left: 10px;
    }

    .display-container {
        display: grid;
        grid-template-columns: repeat(8, fit-content(12.5%));
        gap: 0;
        width: auto;
    }

    .octet {
        width: auto;
        margin-left: 0px;
    }

    .lr-container {
        display: flex;
        
    }

</style>


