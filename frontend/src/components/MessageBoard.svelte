<script lang="ts">
	import { keypress_store, rom_description, rom_mappings } from "$lib/stores/cpu_state";

    const numToKey: any = {
    1: "1", 2: "2", 3: "3", 0xC: "4",
    4: "q", 5: "w", 6: "e", 0xD: "r",
    7: "a", 8: "s", 9: "d", 0xE: "f",
    0xA: "z", 0: "x", 0xB: "c", 0xF: "v"

};

$: curr_key = (numToKey[$keypress_store])

</script>

<div class="container">
    <div class="controls">
        {#if $rom_mappings.length > 0}
            <div class="c-header">
                keyboard controls
            </div>
            {#each $rom_mappings as mapping}
                <div class="mapping {mapping.keyboard === curr_key ? "highlight":""}">
                    <span class="{mapping.keyboard === curr_key ? "mono":"keymap"}">{mapping.keyboard}</span>  {mapping.description}
                </div>
            {/each}
        {:else}
        <div class="c-header">
            keyboard controls
        </div>
        {/if}
    </div>
</div>


<style>
    .container {
        width: 400px;
    }

    .highlight {
        background-color: coral;
        border-radius: 4px;
    	box-shadow: 5px 5px 0px -1px lightblue;
    }

    .mono {
        font-family: monospace;
        text-align: center;
        padding-left: 1%;
        padding-right: 1%;
    }

    .mapping {
        margin-top: 5px;
    }

    .keymap {
        background-color: coral;
        text-align: center;
        font-family: monospace;
        border-radius: 4px;
    	box-shadow: 5px 5px 0px -1px lightblue;
        padding-left: 1%;
        padding-right: 1%;

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