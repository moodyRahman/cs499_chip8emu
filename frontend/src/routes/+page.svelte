
<script lang="ts">
    import { 
        add, add_internal, 
        read_internal, write_to_memory, 
        read_all_memory, read_from_memory, 
        read_display, draw, init, random_color } 
    from "$lib/chip8/release.js";
    
    let x = 0
    let cell = "";
    let data = "";


    $: trigger = 0

    init();

    const reactive_read_display = (): boolean[][] => {
        display = read_display();
        return read_display()
    }

    $: display = reactive_read_display()


    const write = () => {
        write_to_memory(parseInt(cell), parseInt(data))
    }


    $: readAllMemory=() => {
        trigger;
        return read_all_memory();
    }

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
    <button on:click={() => {add_internal()}}>
        click here to add one to the wasm module
    </button>
    <button on:click={() => {x = read_internal()} }>
        read internal: {x}
    </button>
</p>


<p>
    some memory stuffs
</p>

<p>

    <input bind:value={cell} placeholder="location" > 
    <input bind:value={data} placeholder="data" > 

    <button on:click={write}>write to memory</button>
    hmm
</p>

<p>
    {readAllMemory()} <button on:click={() => {trigger++}} >read from memory</button>
</p>

<div class="grid-container">
    
    {#each display as row, x}
        {#each row as cell, y}
            <div class="disp{cell}" >{x}, {y}</div>
        {/each}
    {/each}

    <!-- {display} -->

    <button on:click={() => {
        random_color(Math.floor(Math.random() * 10) , Math.random() * 10 ); 
        reactive_read_display()
    }}>draw via cpu implemented method</button>

<button on:click={() => {
    draw(Math.floor(Math.random() * 10) , Math.random() * 10 ); 
    reactive_read_display()
}}>draw via directly accessing the draw functions</button>
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