<script lang="ts">
	import { rom_description, rom_mappings } from "$lib/stores/cpu_state";


</script>

<div class="container">
    <span>
        {$rom_description}
    </span>
    <div>
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
</style>