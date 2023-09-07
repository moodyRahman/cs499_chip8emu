
<script>
    import { add } from "$lib/wasm/release.js";
    $: count = 0
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>


<p>
    lets run some wasm code!
</p>

<p>
    {add(4, 5)}
</p>
