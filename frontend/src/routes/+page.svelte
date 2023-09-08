
<script>
    import { add, add_internal, read_internal, write_to_memory, read_from_memory} from "$lib/chip8/release.js";
    let x = 0
    let cell = "";
    let data = "";

    let sixer = 0;

    const write = () => {
        write_to_memory(parseInt(cell), parseInt(data))
    }
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

    <button on:click={() => {sixer = read_from_memory(6)}}>
        memory at 6 contains: {sixer}
    </button>

</p>