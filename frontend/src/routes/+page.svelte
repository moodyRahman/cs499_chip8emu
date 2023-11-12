

<script lang="ts">

    import * as chip8 from "$lib/chip8/debug.js";
	import Display from "../components/Display.svelte";
	import Loader from "../components/Loader.svelte";
	import RomDump from "../components/RomDump.svelte";
	import Registers from "../components/Registers.svelte";
	import SingleInstruction from "../components/SingleInstruction.svelte";
	import { display_trigger } from "$lib/stores/cpu_state";
	import Header from "../components/Header.svelte";


    const bindFunc = (wasmfunc: CallableFunction) => {    
        return {
            func: (_trigger: number) => {  
                return wasmfunc()
            },
            trigger: 0
        }
    }

    let debug = false;


    const generate_spacing_css = () => {

    }


    // let {func: read_all_registers, trigger: read_all_registers_trigger} = bindFunc(() => {return chip8.read_all_registers()})
    // $: read_all_registers(read_all_registers_trigger)

    
</script>

<div>
    <Header />
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


<style>

@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

    :global(html) {
        box-sizing: border-box;
    }
    :global(*, *:before, *:after) {
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


