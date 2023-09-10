
<script lang="ts">
    import { add, add_internal, read_internal, write_to_memory, read_all_memory, read_from_memory } from "$lib/chip8/release.js";
	import { draw } from "svelte/transition";
    let x = 0
    let cell = "";
    let data = "";

    let sixer = 0;

    // let val = [
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

      
    // ];

    let val = Array.from(Array(1000), _ => {
        return Array.from(Array(100), _ => Math.floor(Math.random()*100000))
    } );

    let interval_id = 0

    let draw_timestamps: number[] = [];


    $: trigger = 0

    const write = () => {
        write_to_memory(parseInt(cell), parseInt(data))
    }


    $: readAllMemory=() => {
        trigger;
        return read_all_memory();
    }

    // while (true) {
    //     val++;
    // }

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>


<p>
    lets run some wasm code!
</p>

<p>
    <button on:click={() => {add_internal()}}>
        click here to add one to the wasm module
    </button>
    <button on:click={() => {x = read_internal()} }>
        read internal: {x}
    </button>
</p>


<p>
    some memory stuffs
</p>

<p>

    <input bind:value={cell} placeholder="location" > 
    <input bind:value={data} placeholder="data" > 

    <button on:click={write}>write to memory</button>

</p>

<p>
    {readAllMemory()} <button on:click={() => {trigger++}} >read from memory</button>
</p>


<p>

    {val.length} rows, {val[0].length} columns of data <br>
</p>
<div>
    rerendering test:
    <button on:click={() => {

        if (interval_id === 0) {
            interval_id = setInterval(() => {
                let rx = Math.floor(Math.random() * val.length)
                let ry = Math.floor(Math.random() * val[0].length)

                let new_buffer = val.map((x, ix) => x.map((y, iy) => {
                    // return (ix === rx && iy === ry)?(y === 0?1:0):(y)
                    return (ix === rx && iy === ry)?(0):(y)

                }))

                console.log("made a whole new buffer")
                val=new_buffer
                draw_timestamps = [...draw_timestamps, Date.now()]
            }, 0.1)
        }
        else {
            clearInterval(interval_id)
            interval_id = 0;
        }


    }}>
        start
    </button>

    {draw_timestamps[draw_timestamps.length - 1] - draw_timestamps[draw_timestamps.length - 2]} milliseconds since the last draw

<br>
    {((mood)=>{
        const l_1000 = draw_timestamps.slice(-100).reverse()

        return Array.from(Array(99).keys()).map((x, i) => {
            return l_1000[x] - l_1000[x + 1]
        })
        .reduce((sum, curr) => {
            return sum + curr
        }) / 100
    })(draw_timestamps)}

<!-- {draw_timestamps.slice(-1000).map((x, i) => {
    return x - draw_timestamps.slice(-1001)[i-1];
}).reduce((sum, curr) => {return sum + curr}, 0)} -->


    milliseconds since the last draw, 1000 sample average


    <div style="padding: 10px; text-wrap: wrap; word-break: break-all;">
    {#each val as row}
        {row}
    {/each}
    </div>

</div>