

<script lang="ts">
	import Display from "../components/Display.svelte";
	import Loader from "../components/Loader.svelte";
	import RomDump from "../components/RomDump.svelte";
	import Registers from "../components/Registers.svelte";
	import SingleInstruction from "../components/SingleInstruction.svelte";


    let debug = false;


    // let {func: read_all_registers, trigger: read_all_registers_trigger} = bindFunc(() => {return chip8.read_all_registers()})
    // $: read_all_registers(read_all_registers_trigger)

    
</script>

<div>
    <button on:click={() => debug = !debug}>
        toggle debug
    </button>
</div>

<div>
    <Loader />
</div>

{#if debug}
<div>
    <SingleInstruction />
</div>

<div>
    <Registers />
</div>
{/if}

<div class="lr-container">
    <Display />
    <RomDump bind:debug={debug} />
</div>


<style>

    .lr-container {
        display: flex;
        height: auto;
        gap: 2%;
    }

    div {
        margin-bottom: 2%;
    }


</style>


