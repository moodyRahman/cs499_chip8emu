

<script lang="ts">

    import * as chip8 from "$lib/chip8/debug.js";
	import Display from "../components/Display.svelte";
	import Loader from "../components/Loader.svelte";
	import RomDump from "../components/RomDump.svelte";
	import Registers from "../components/Registers.svelte";
	import SingleInstruction from "../components/SingleInstruction.svelte";
	import { display_trigger } from "$lib/stores/cpu_state";


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

<div>
    <button on:click={() => debug = !debug}>
        toggle debug
    </button>
</div>

<Loader />

{#if debug}
    <SingleInstruction />
    <Registers />
{/if}

<div class="lr-container">
    <Display />
    <RomDump bind:debug={debug} />
</div>

<div>
    <button on:click={() => { chip8.debug_set_pixel(px, py); display_trigger.update((n) => n+1);}} >draw pixel</button>

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
        margin-left: 10%;
        margin-right: 10%;
        margin-top: 3%;
        margin-top: 3%;


    }

    .lr-container {
        display: flex;
        height: auto;
    }


</style>


