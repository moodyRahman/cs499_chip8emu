<script lang="ts">
	import { sprites_array } from "$lib/stores/cpu_state";


    // the enemy
    // 0x81, 0x42, 0x36, 0x00, 0x66, 0x44, 0x10, 0x0c, 0x10, 0x00, 0x7e
    let pixels: boolean[][] = [...Array(15).fill(0)].map((x) => (Array(8).fill(false)))

    let binary_editor:boolean = false

    const row_to_hex = (row: boolean[]): number => {
        let out = 0;
        for (let x = 0; x < row.length; x++) {
            out = out << 1 | (row[x]?1:0)
        }
        return out
    }

    const pixels_to_hex = (pixels: boolean[][]): number[] => {
        let out: number[] = []
        
        pixels.forEach((row, i) => {
            let val = 0;
            out.push()
        });

        return out
    }

    let name = ""

    let string_to_load = "";

    const loadString = () => {
        let stripped = string_to_load
        .replace(/ /g, '')    // remove spaces
        .split(",")           // split on commas
        .map((x) => Number(x).toString(2).padStart(8, "0").slice(0, 8)) // convert to a binary string, capped at 8 characters
        .map((x) => x.split("")) // convert each binary string to an array of string 0 or 1's
        .map((x) => {
            return x.map((bin) => bin === "1")    // essentially suppresses all bad errors, 
        })                                        // as characters in "NaN" that non-hex inputs
                                                  // convert to, get padded to "00000Nan", and then 
                                                  // comparing each character to "1" coerces the "Nan"
                                                  // portion to become [... false, false, false]
        
        while (stripped.length < 16) {
            stripped.push([false, false, false, false, false, false, false, false])
        }

        pixels = structuredClone(stripped)
    }

    
    let sprites:{
        name: string,
        pixels: boolean[][]
    }[] = []

    sprites_array.subscribe((n) => {n = sprites})

    let copy_status = "copy to clipboard"

    const handleSave = (e:MouseEvent) => {
        $sprites_array = [...$sprites_array, {
            name:name === ""?"unnamed sprite":name,
            pixels:JSON.parse(JSON.stringify(pixels))
        }]
    }

    const handleCopy = (e:MouseEvent) => {
        let raw = pixels
        .map((x) => row_to_hex(x))
        .map((x) => "0x" + x.toString(16))
        .join(", ")

        navigator.clipboard.writeText(raw)
        copy_status = "copied!"
        setTimeout(() => copy_status = "copy to clipboard", 1000)
        console.log(raw)
    }
    

</script>
<div class="outer-container">
    <div class="header">
        sprite editor
    </div>
    <div class="container">
        <div>
            saved sprites
            {#each $sprites_array as sprite, i}
            <div>
                <button on:click={() => {
                    pixels = JSON.parse(JSON.stringify($sprites_array[i].pixels))
                    name = $sprites_array[i].name
                }}>
                    {sprite.name}
                </button>
            </div>
                {/each}
        </div>
        <div>
        <div>
            <input type="text" bind:value={name} placeholder="enter sprite name">
            <button on:click={handleSave}>save</button>
            <button on:click={handleCopy}>
                {copy_status}
            </button>
            <button on:click={() => {
                pixels = [...Array(15).fill(0)].map((x) => (Array(8).fill(false)))
                name=""
                string_to_load = ""
            } }>reset</button>
        </div>
        <div class="grid">
            {#each Array(15) as y, yi }
                <span class="row_c">
                    {(yi + 1).toString(16)}
                </span>
                    {#each Array(8) as x, xi}
                    <!-- <span on:click={() => pixels[yi][xi] = true} aria-pressed="mixed" on:keypress={() => {}}>
                        {yi}, {xi}
                    </span> -->
                    <button 
                    on:mousedown={(e) => {
                        pixels[yi][xi] = !pixels[yi][xi]
                    }}

                    class={`${pixels[yi][xi]?"inactive":"active"} pixel`}>
                        
                    </button>
                    {/each}

                {#if binary_editor}
                <div class="result">
                    <input type="number" pattern="[0-1]" required>
                </div>
                {:else}
                    <span class="result">
                        0x{row_to_hex(pixels[yi]).toString(16).padStart(2, "0")}
                    </span>
                {/if}
            {/each}
        </div>
        </div>

    </div>
    <div class="loader">
        <input type="text" bind:value={string_to_load}> <button on:click={loadString}>load string into sprite</button>
    </div>
</div>



<style>

    input {
        padding: 0;
        margin: 0;
        height: 18px;
    }

    button {
        border: 1px solid lightcoral;
        border-radius: 4px;
        box-shadow: 0px 0px 0px 0px lightcoral;
    }

    .loader {
        width: 100%;
    }

    .loader > input {
        width: 50%;
    }

    .header {
        font-size: 1.75rem;
    }
    .outer-container {
        display: flex;
        flex-direction: column;
        padding: 2%;
        margin-top: 3%;
        background-color: lightcoral;
        border-radius: 4px;
        border: 1px solid lightblue;
        border-radius: 4px;
        box-shadow: 5px 5px 0px -1px lightblue;
    }
    .container {
        display: flex;
        flex-direction: row;
        gap: 3rem;
    }
    .grid {
        display:inline-grid;
        gap: 0 0;
        grid-template-columns: max-content repeat(8, 1fr) 40px;
    }

    button.pixel {
        border: 1px solid black;
        margin: 0px;
        padding: 0px;
        display: inline;
        width: 20px;
        height: 20px;
        border-radius: 0px;
    }

    .result {
        width: 30px;
        padding-left: 10px;
    }

    .row_c {
        padding-right: 10px;
    }

    .inactive {
        background-color: white;
    }

    .inactive {
        background-color: black;
    }
</style>