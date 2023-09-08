
<script>
    import { add, add_internal, read_internal } from "$lib/chip8/release.js";
    let x = 0

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
