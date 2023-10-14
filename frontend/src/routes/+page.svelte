

<script lang="ts">

    import * as chip8 from "$lib/chip8/debug.js";
	import Octet from "../components/Octet.svelte";

    const bindFunc = (wasmfunc: CallableFunction) => {    
        return {
            func: (_trigger: number) => {  
                return wasmfunc()
            },
            trigger: 0
        }
    }
    
    
    let input = ""
    let px = 0;
    let py = 0;
    let register = 0

    let {func: read_instruction, trigger: read_instruction_trigger} = bindFunc(() => {
        const out = chip8.read_instruction(Number(input)); 
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
    <input type="text" placeholder="enter instruction here" bind:value={input}>
</div>

<div>
    <button on:click={() => { read_instruction_trigger++;}}>run the instruction</button>
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
</div>

<div class="display-container">
    
    {#each read_display(read_display_trigger) as pixel_group }
    
        <Octet data={pixel_group} />
    
    {/each}
</div>

<div>
    <button on:click={() => { chip8.debug_set_pixel(px, py); read_display_trigger++}} >draw pixel</button>
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

</style>


