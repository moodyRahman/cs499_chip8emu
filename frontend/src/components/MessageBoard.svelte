<script lang="ts">
	import { rom_description, rom_mappings } from "$lib/stores/cpu_state";


</script>

<div class="container">
    <div class="controls">
        {#if $rom_mappings.length > 0}
            <div class="c-header">
                keyboard controls
            </div>
            {#each $rom_mappings as mapping}
                <div class="mapping">
                    <span class="keymap">{mapping.keyboard}</span>  {mapping.description}
                </div>
            {/each}
        {:else}
        no controls metadata found
        {/if}
    </div>
</div>


<style>
    .container {
        width: 400px;
    }

    .mapping {
        margin-top: 5px;
    }

    .keymap {
        background-color: coral;
        padding-left: 1%;
        padding-right: 1%;
        text-align: center;
        font-family: monospace;
        border-radius: 4px;
    	box-shadow: 5px 5px 0px -1px lightblue;

    }

    .c-header {
        color: black;
        background-color: coral;
        margin-bottom: 1%;
        width: fit-content;
        padding: 1%;
        border-radius: 4px;
    	box-shadow: 5px 5px 0px -1px lightblue;
    }

    .controls {
        color: black;
        padding-top: 4%;
        padding-bottom: 4%;
    }

    div {
        font-size: 1.5rem;
    }
</style>