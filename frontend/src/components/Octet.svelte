<script lang="ts">
	import Pixel from "./Pixel.svelte";

    export let data: number;
    $: data = 0;
</script>

<span>
    {#each data.toString(2).padStart(8, "0") as x }
    
        <Pixel pixel={parseInt(x)} />

    {/each}
</span>


<style>
    span {
        padding: 0px;
        margin: 0px;
    }
</style>