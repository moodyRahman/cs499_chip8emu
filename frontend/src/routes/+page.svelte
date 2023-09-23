
<script lang="ts">
	import { data_test } from "$lib/chip8/debug";


    import * as chip8 from "$lib/chip8/release.js";
    
    let x = 0
    let cell = "";
    let data = "";

    let cpu_tick = chip8.read_cpu_tick();

    chip8.init();

    

    const bindFunc = (wasmfunc: CallableFunction) => {
        
        return {
            func: (_trigger: number) => {  
                return wasmfunc()
            },
            trigger: 0
        }
    }
    
    let {func: read_all_memory, trigger: read_all_memory_trigger} = bindFunc(chip8.read_all_memory)    
    $: read_all_memory(read_all_memory_trigger)


    let {func: read_display, trigger: read_display_trigger} = bindFunc(chip8.read_display)
    $: read_display(read_display_trigger)

    // while (true) {
    //     val++;
    // }

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>


<p>
    lets run some wasm code!
</p>

<p>
    <button on:click={() => {chip8.add_internal()}}>
        click here to add one to the wasm module
    </button>
    <button on:click={() => {x = chip8.read_internal()} }>
        read internal: {x}
    </button>
</p>


<p>
    some memory stuffs
</p>

<p>

    <input bind:value={cell} placeholder="location" > 
    <input bind:value={data} placeholder="data" > 

    <button on:click={() => {
        chip8.write_to_memory(parseInt(cell), parseInt(data))
    }}>write to memory</button>
    hmm
</p>

<p>
    {read_all_memory(read_all_memory_trigger)} <button on:click={() => {read_all_memory_trigger++}} >read from memory</button>
</p>

<div class="grid-container">
    
    {#each read_display(read_display_trigger) as row, x}
        {#each row as cell, y}
            <div class="disp{cell}" >{x}, {y}</div>
        {/each}
    {/each}

    <!-- {display} -->

    <button on:click={() => {
        chip8.random_color(Math.floor(Math.random() * 10) , Math.random() * 10 ); 
        read_display_trigger++
    }}>draw via cpu implemented method</button>

<button on:click={() => {
    chip8.draw(Math.floor(Math.random() * 10) , Math.random() * 10 ); 
    read_display_trigger++
}}>draw via directly accessing the draw functions</button>
</div>

<div>
    <button on:click={chip8.trigger_cpu_tick}>
        tick cpu
    </button>

    <button on:click={() => {
        cpu_tick = chip8.read_cpu_tick()
    }}>
        cpu contains: {cpu_tick}
    </button>

</div>

<div>
    <!-- {JSON.parse(chip8.data_test()).prop} -->
    {JSON.parse(chip8.data_test()).name}
</div>



<style>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(10, 1fr); /* 20 columns */
    grid-template-rows: repeat(10, 1fr); /* 20 rows */
    gap: 1px; /* Adjust gap size as needed */
    width: 400px; /* Adjust the width of the grid container */
    height: 400px; /* Adjust the height of the grid container */
}

.dispfalse {
    background-color: gray;
}
</style>