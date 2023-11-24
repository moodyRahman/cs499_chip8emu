<script lang="ts">
	import { rom_description, rom_mappings, rom_status } from "$lib/stores/cpu_state";
    import img from "../lib/Screenshot_2023-11-23_at_4.55.06_PM.png"

</script>

<div>
    <div>
        
    {#if $rom_description}
        {$rom_description}
        {#if $rom_mappings}
            {#each $rom_mappings as mappings}
            <div>
                {mappings?.keyboard}: {mappings?.description}
            </div>
            {/each}
        {:else}
            no additional metadata
        {/if}
    {:else}
    <div>
        view help page to see the current mapping
    </div>
    {/if}
    </div>

    <div>
    </div>
</div>


<style>

</style>