<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
	import { display_trigger, registers_trigger } from "$lib/stores/cpu_state";

    let arbitrary_inst: string = "";

    
    let px = 0;
    let py = 0;


    let display_help = false;

</script>

<div class="run-info">
    <div class="run_one">
        <div>
            <input type="text" placeholder="enter instruction here" bind:value={arbitrary_inst}>
        </div>
        
        <div>
            <button on:click={() => { chip8.read_instruction(Number(arbitrary_inst)); registers_trigger.update((n) => n+1); display_trigger.update((n) => n+1); console.log(chip8.convert_inst_to_string(Number(arbitrary_inst)))}}>run the instruction</button>
            <button on:click={()=> display_help = !display_help}>toggle help</button>
        </div>
        <div>
            <div>    
                draw pixels: <input type="number" bind:value={px} placeholder="x"> <input type="number" bind:value={py} placeholder="y">
            </div>
            <div>
                <button on:click={() => { chip8.debug_set_pixel(px, py); display_trigger.update((n) => n+1);}} >draw pixel</button>
            
            </div>
        </div>
    </div>

    {#if display_help}
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
    {/if}
</div>

<style>
    .run-info {
        display: flex;
        height: auto;
        margin-bottom: 20px;
    }

    .run_one {
        align-self:self-end;
    }

</style>