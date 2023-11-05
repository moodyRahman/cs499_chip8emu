<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
    
    export let raw_rom: Uint8Array = new Uint8Array();
    export let rom_name: string;

    let pc = 0;
    let page = 0;

</script>
<div class="container">
    <div>
        {rom_name} {raw_rom.length} bytes
    </div>
    <div class="dump">
        {#each raw_rom.slice(page * 352, page*352 + 352) as cell, i}
            {#if i%16 == 0}
            <div>{(i / 16).toString(16).padStart(8, "0")}</div>
            {/if}
            <div id={i.toString()}>{cell.toString(16).padStart(2, "0")}</div>
        {/each}

    </div>
    <div class="buttons">
        <div>
            <button on:click={() => page === 0 ?page:page--}>previous</button>
            {page}
            <button on:click={() => page === Math.floor(raw_rom.length/352) ? page:page++}>next</button>
        </div>
        <div>
            <button class="tick">
                tick cpu
            </button>
        </div>
    </div>
</div>



<style>


    .container {
        display: flex;
        flex-direction: column;
    }

    .buttons {
        align-self:flex-start;
    }

    .dump {
        display:inline-grid;
        grid-template-columns: max-content repeat(16, 1fr);
    }

    .dump > div {
        margin: 2.5px;
    }

    .tick {
        font-size: 20px;
    }
</style>

