<script lang="ts">

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

    let sprites:{
        name: string,
        pixels: boolean[][]
    }[] = []


    const handleSave = (e:MouseEvent) => {
        sprites = [...sprites, {
            name:name === ""?"unnamed sprite":name,
            pixels:JSON.parse(JSON.stringify(pixels))
        }]
    }
    

</script>
<div class="container">
    <div>
        saved sprites
        {#each sprites as sprite, i}
        <div>
            <button on:click={() => {
                pixels = JSON.parse(JSON.stringify(sprites[i].pixels))
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
        <button on:click={() => pixels = [...Array(15).fill(0)].map((x) => (Array(8).fill(false)))}>reset</button>
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
                    0x{row_to_hex(pixels[yi]).toString(16)}
                </span>
            {/if}
        {/each}
    </div>
    </div>

</div>


<style>

    input {
        padding: 0;
        margin: 0;
        height: 18px;
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

    .pixel {
        border: 1px solid black;
        margin: 0px;
        padding: 0px;
        display: inline;
        width: 20px;
        height: 20px;
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