<script lang="ts">
	import { rom_description, rom_mappings, rom_status } from "$lib/stores/cpu_state";


</script>

<div>
    <div>
        
    {#if $rom_description}
        {$rom_description}
    {:else}
        no description
    {/if}
    </div>

    <div>
        {#if $rom_mappings}
            {#each $rom_mappings as mappings}
            <div>
                {mappings?.keyboard}: {mappings?.description}
            </div>
            {/each}
        {:else}
            no additional metadata
        {/if}
    </div>
</div>


<style>

</style>