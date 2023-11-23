<script lang="ts">
	import { rom_description, rom_mappings, rom_status } from "$lib/stores/cpu_state";


</script>

<div>
    <div>
        {$rom_description}
    </div>
    <div>
        {#each $rom_mappings as mappings}
        <div>
            {mappings?.keyboard}: {mappings?.description}
        </div>
        {/each}
    </div>
</div>


<style>

</style>