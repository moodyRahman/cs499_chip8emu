<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
	import { audio_store, debug_mode_store, keypress_store, registers_trigger, rom_mappings } from "$lib/stores/cpu_state";
    import highScore from "$lib/highscore.js"

    let data = [1, 2, 3, 0xc, 4, 5, 6, 0xd, 7, 8, 9, 0xe, 0xa, 0, 0xb, 0xf]
    let keys = ["1", "2", "3", "4", "q", "w", "e", "r", "a", "s", "d", "f", "z", "x", "c", "v"]

    const keyToNum: any = {
        "1" : 1, "2" : 2, "3" : 3, "4" : 0xC,
        "q" : 4, "w" : 5, "e" : 6, "r" : 0xD,
        "a" : 7, "s" : 8, "d" : 9, "f" : 0xE,
        "z" : 0xA, "x" : 0, "c" : 0xB, "v" : 0xF
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key == "l") {
            console.log(highScore());
        }
        // @ts-ignore comments
        let key = keyToNum[event.key];
        if (key != undefined) {
            chip8.set_key(chip8.get_key() | (1 << key));
            registers_trigger.set($registers_trigger + 1);
            keypress_store.set(event.key)
        }
    }

    function handleKeyup(event: KeyboardEvent) {
        // @ts-ignore comments
        let key = keyToNum[event.key];
        if (key != undefined) {
            chip8.set_key(chip8.get_key() & (~(1 << key)));
            registers_trigger.set($registers_trigger + 1);
            if (chip8.get_key() === 0)
            {
                keypress_store.set("")
            }
        }
    }
    
</script>

<div>
    <div class="pad">
        {#each data as cell, i}
        {#if keyToNum[$keypress_store] === cell}
        <div class="pressed">
            {keys[i]} | {cell.toString(16)}
        </div>
        {:else}
        <div>
            {keys[i]}
        </div>
        {/if}

        {/each}

    </div>

    <div class="current">
        {$keypress_store}
    </div>

    
</div>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />


<style>


.pad {
    display:grid;
    gap: 4px;
    grid-template-columns: repeat(4, 25%);
}

.pad > div {
    background-color: coral;
    color: white;
    text-align: center;
    padding: 1rem;
    width: 100%;
}

.pad > div.pressed {
    background-color: lightblue;
}

.current {
    height: 1rem;
}

</style>