<script lang="ts">
	import { rom_description, rom_mappings } from "$lib/stores/cpu_state";


</script>

<div class="container">
    <div>
        {$rom_description}
    </div>
    <div class="controls">
        <div class="c-header">
            keyboard controls
        </div>
        {#each $rom_mappings as mapping}
        <div>
            {mapping.keyboard} {mapping.description}
        </div>
        {/each}
    </div>
</div>


<style>
    .container {
        width: 400px;
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