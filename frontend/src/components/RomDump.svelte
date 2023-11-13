<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
	import { base_store, display_trigger, registers_trigger, rom, rom_name as rom_name_store } from "$lib/stores/cpu_state";

    import config from "../cpu_configs";
    
    let raw_rom: Uint8Array = new Uint8Array();

    rom.subscribe((n) => {
        raw_rom = n;
    })

    let rom_name: string;
    rom_name_store.subscribe((n) => rom_name = n)

    // export let registers_trigger: number;
    export let debug: boolean = false;

    let cpu_ticks = 0;

    registers_trigger.subscribe((n) => {
        cpu_ticks = n;
    })

    let pc = 512;
    let page = 0;

    // id of the setinterval that's ticking the cpu, set to 0 when cpu should stop ticking
    let ticker = 0;

    // set the cpu cycles per second
    $: ({ticks_per_interval, time_between_intervals_ms, display_rerender_threshold} = debug ? 
            {
                ticks_per_interval:1, 
                time_between_intervals_ms:100,
                display_rerender_threshold:1
            } : config.hertz);

    let rows = config.rom_dump_display_rows;

    let base: number;
    base_store.subscribe((n) => base = n);



    $: curr_inst = (raw_rom?(raw_rom[pc - 512] << 8 | raw_rom[pc - 512 + 1]):0)
    $: raw_rom, pc = 512, page = 0

    const generate_css_str = (page: number, i: number, pc: number) => {
        return `background-color:${((page * 352 + 512 + i) === pc || (page * 352 + 512 + i) === pc+1)?"black":"" };` + 
        `color:${((page * 352 + 512 + i) === pc || (page * 352 + 512 + i) === pc+1)?"white":"" };`
    }


    const tick = () => {
        // console.log("#", read_display_trigger, ", ", chip8.convert_inst_to_string(curr_inst))
        pc = chip8.tick(); 
        registers_trigger.update((n) => n+1);
        if (cpu_ticks % display_rerender_threshold === 0)
        {
            console.log(cpu_ticks)
            display_trigger.update((n) => n+1)
        }
    }

    const n_tick = (n: number) => {
        for (let x = 0; x < n; x++)
        {
            tick();
        }
    }

    
    // setInterval(() => {pc = chip8.tick(); registers_trigger++}, 100)


</script>
<div class="container">

    {#if raw_rom.length > 0}

    <div>
        {rom_name} {raw_rom.length} bytes
    </div>
{#if debug}
    <div class="dump">
        {#each ["", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as x, i}
        <div class={x === ""?"":"offset"}>
            {x}
        </div>
        {/each}


        {#each raw_rom.slice(page * rows * 16, page*rows*16 + (rows * 16)) as cell, i}
            {#if i%16 == 0}
            <div class="sidebar">{ (32+((page*rows) + ((i / 16)))).toString(16).padStart(7, "0").padEnd(8, "*")}</div>
            {/if}
        <div id={(page * (16*rows) + 512 + i).toString()} style={generate_css_str(page, i, pc)} >{cell.toString(base).padStart(2, "0")}</div>
        {/each}
        
    </div>
    {/if}
    <div class="buttons">
        {#if debug}
        <div>
            <button on:click={() => page === 0 ?page:page--}>previous</button>
            {page}
            <button on:click={() => page === Math.floor(raw_rom.length/(rows*16)) ? page:page++}>next</button>
        </div>
        {/if}
        
        <div>
            <div>

                {#if debug}
                <button class="tick" on:click={tick}>
                    tick cpu {curr_inst.toString(16).padStart(4, "0")} | {chip8.convert_inst_to_string(curr_inst)}
                </button>
                
                {:else}
                <button class="tick" on:click={tick}>
                    tick cpu
                </button>
                {/if}

            </div>
            <div>


            <button class="tick" on:click={() => {
                if (ticker === 0) {
                    ticker = setInterval(() => {n_tick(ticks_per_interval)}, (time_between_intervals_ms))
                }
                else  {
                    clearInterval(ticker)
                    ticker = 0;
                }
                }}>
                run cpu {ticker==0?"false":"true"}
            </button>
            <button class="tick" on:click={() => {
                chip8.reset();
                registers_trigger.set(0);
                display_trigger.set(0)
                pc = 512;
            }}>
                reset cpu
            </button>
        </div>
        </div>
    </div>

    {:else}
    <div>
        loading...
    </div>
    {/if}

</div>



<style>


    .container {
        display: flex;
        flex-direction: column;
    }

    .buttons {
        align-self:flex-start;
    }

    .sidebar {
        background-color: lightblue;
    }

    .dump {
        display:inline-grid;
        grid-template-columns: max-content repeat(16, 1fr);
    }

    .dump > div {
        margin: 2.5px;
        text-align: center;

    }

    .tick {
        font-size: 20px;
    }

    .offset {
        background-color: lightcoral;
        padding: 3px;

    }
</style>

