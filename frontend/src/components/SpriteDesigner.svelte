<script lang="ts">

    let pixels: boolean[][] = [...Array(15).fill(0)].map((x) => (Array(8).fill(false)))


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
    

</script>
<div>
    build a sprite! <button>binary editor mode</button>
</div>
<div class="grid">
    {#each Array(15) as y, yi }
        {#each Array(8) as x, xi}
        <!-- <span on:click={() => pixels[yi][xi] = true} aria-pressed="mixed" on:keypress={() => {}}>
            {yi}, {xi}
        </span> -->
        <button on:click={() => pixels[yi][xi] = !pixels[yi][xi]} class={`${pixels[yi][xi]?"inactive":"active"} pixel`}>
            
        </button>
        {/each}
        <span class="result">
            0x{row_to_hex(pixels[yi]).toString(16)}
        </span>
    {/each}
</div>


<style>
    .grid {
        display:inline-grid;
        gap: 0 0;
        grid-template-columns: max-content repeat(7, 1fr) 40px;
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

    .inactive {
        background-color: white;
    }

    .inactive {
        background-color: black;
    }
</style>