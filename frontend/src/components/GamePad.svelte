<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
	import { keypress_store, registers_trigger, rom_description, rom_mappings } from "$lib/stores/cpu_state";
    import highScore from "$lib/highscore.js"

    let data = [1, 2, 3, 0xc, 4, 5, 6, 0xd, 7, 8, 9, 0xe, 0xa, 0, 0xb, 0xf]
    let keys = ["1", "2", "3", "4", "q", "w", "e", "r", "a", "s", "d", "f", "z", "x", "c", "v"]

    const keyToNum: any = {
        "1" : 1, "2" : 2, "3" : 3, "4" : 0xC,
        "q" : 4, "w" : 5, "e" : 6, "r" : 0xD,
        "a" : 7, "s" : 8, "d" : 9, "f" : 0xE,
        "z" : 0xA, "x" : 0, "c" : 0xB, "v" : 0xF
    }

    let active_keys: number[] = []

    // let controller = {
    //     "1" : false, "2" : false, "3" : false, "4" : false,
    //     "q" : false, "w" : false, "e" : false, "r" : false,
    //     "a" : false, "s" : false, "d" : false, "f" : false,
    //     "z" : false, "x" : false, "c" : false, "v" : false
    // }

    function handleKeydown(event: KeyboardEvent) {
        if (event.repeat) return;
        if (event.key == "l") {
            console.log(highScore());
        }

        // @ts-ignore comments
        let key = keyToNum[event.key];
        if (key != undefined) {
            
            if (active_keys.findIndex((x) => x === key) === -1){
                active_keys = [...active_keys, key]
            }
            $keypress_store = key;
            chip8.set_key_array(active_keys);
            registers_trigger.set($registers_trigger + 1);
        }
    }

    function handleKeyup(event: KeyboardEvent) {
        // @ts-ignore comments
        let key = keyToNum[event.key];
        if (key != undefined) { 
            active_keys = active_keys.filter((x) => x !== key)
            $keypress_store = active_keys.length > 0? String(active_keys.at(-1)):"";
            chip8.set_key_array(active_keys);
            registers_trigger.set($registers_trigger + 1);
        }
    }
    
</script>


<div>
    <div class="pad">
        {#each data as cell, i}
        {#if active_keys.includes(cell)}
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

</style>