

<script lang="ts">

    import * as chip8 from "$lib/chip8/debug.js";
	import Disassembler from "../components/Disassembler.svelte";
	import Display from "../components/Display.svelte";
    import { onMount } from 'svelte';
	import Loader from "../components/Loader.svelte";
	import RomDump from "../components/RomDump.svelte";
	import Registers from "../components/Registers.svelte";


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

    let rom_name = "SpaceInvaders.ch8"
    let rom = new Uint8Array()

    let registers_trigger = 0
    let read_display_trigger = 0;

    let debug = false;



    let {func: read_instruction, trigger: read_instruction_trigger} = bindFunc(() => {
        const out = chip8.read_instruction(Number(arbitrary_inst)); 
        registers_trigger++;
        return out
    })
    $: read_instruction(read_instruction_trigger)


    // let {func: read_all_registers, trigger: read_all_registers_trigger} = bindFunc(() => {return chip8.read_all_registers()})
    // $: read_all_registers(read_all_registers_trigger)

    
</script>

<div class="run-info">
    <div class="run_one">
        <div>
            <input type="text" placeholder="enter instruction here" bind:value={arbitrary_inst}>
        </div>
        
        <div>
            <button on:click={() => { read_instruction_trigger++; read_display_trigger++; console.log(chip8.convert_inst_to_string(Number(arbitrary_inst)))}}>run the instruction</button>
        </div>
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
</div>

<div>
    <button on:click={() => debug = !debug}>
        toggle debug
    </button>
</div>

<Loader bind:rom_name={rom_name} bind:rom={rom} />

{#if debug}
    <Registers bind:registers_trigger={registers_trigger} />
{/if}

<div class="lr-container">
    <Display trigger={read_display_trigger} />
    <RomDump raw_rom={rom} rom_name={rom_name} bind:registers_trigger={registers_trigger} bind:read_display_trigger={read_display_trigger} bind:debug={debug} />
</div>

<div>
    <button on:click={() => { chip8.debug_set_pixel(px, py); read_display_trigger++;}} >draw pixel</button>

</div>


<div>
    draw pixels: <input type="number" bind:value={px} placeholder="x"> <input type="number" bind:value={py} placeholder="y">
</div>


<style>

@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

    :global(html) {
    box-sizing: border-box;
    }
    *, *:before, *:after {
    box-sizing: inherit;
    }

    :global(*) {
        font-family: 'Roboto', sans-serif;
    }

    :global(body) {
        margin: 7%;
        padding: 3.5%;

    }

    .lr-container {
        display: flex;
        height: auto;
    }

    .run-info {
        display: flex;
        height: auto;
        margin-bottom: 20px;
    }

    .run_one {
        align-self:self-end;
    }
</style>


