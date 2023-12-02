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
                <div>
                    press <span class="keymap">{mapping.keyboard}</span> to {mapping.description}
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

    .description {
        font-size: 1rem;
    }

    .keymap {
        background-color: coral;
        padding-left: 1%;
        padding-right: 1%;
        text-align: center;
        font-family: monospace;

    }

    .c-header {
        color: black;
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