<script lang="ts">
	import { rom_description, rom_mappings } from "$lib/stores/cpu_state";


</script>

<div>
    <div>
        {$rom_description}
    </div>
    <div>
        {#each $rom_mappings as mapping}
        <div>
            {mapping.keyboard} {mapping.description}
        </div>
        {/each}
    </div>
</div>