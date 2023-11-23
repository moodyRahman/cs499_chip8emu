<script lang="ts">

    import * as chip8 from "$lib/chip8/debug.js";
	import { display_trigger } from "$lib/stores/cpu_state";
	import Octet from "./Octet.svelte";
    
    let trigger: number;

    display_trigger.subscribe((n) => {
        trigger = n;
    })

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
        display: inline-grid;
        grid-template-columns: repeat(8, fit-content(12.5%));
        grid-gap: 0px 0px;
        width: auto;
        height:100%;
    }
</style>