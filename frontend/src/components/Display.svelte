<script lang="ts">

    import * as chip8 from "$lib/chip8/debug.js";
	import Octet from "./Octet.svelte";
    export let trigger: number;
    let buffer: Uint8Array

    $: trigger, buffer=chip8.display()


</script>

<div class="display-container">
        
    {#each buffer as pixel_group }
    
        <Octet data={pixel_group} />
    
    {/each}
</div>

<style>
    .display-container {
        display: grid;
        grid-template-columns: repeat(8, fit-content(12.5%));
        gap: 0;
        width: auto;
    }
</style>