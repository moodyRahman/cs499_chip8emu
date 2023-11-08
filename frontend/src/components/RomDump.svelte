<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";

    import config from "../cpu_configs";
    
    export let raw_rom: Uint8Array = new Uint8Array();
    export let rom_name: string;
    export let registers_trigger: number;
    export let read_display_trigger: number;

    

    let pc = 512;
    let page = 0;

    // id of the setinterval that's ticking the cpu, set to 0 when cpu should stop ticking
    let ticker = 0;

    // set the cpu cycles per second
    let hertz = config.hertz;

    let rows = config.rom_dump_display_rows;



    $: curr_inst = (raw_rom?(raw_rom[pc - 512] << 8 | raw_rom[pc - 512 + 1]):0)
    $: raw_rom, pc = 512, page = 0

    const generate_css_str = (page: number, i: number, pc: number) => {
        return `background-color:${((page * 352 + 512 + i) === pc || (page * 352 + 512 + i) === pc+1)?"black":"" };` + 
        `color:${((page * 352 + 512 + i) === pc || (page * 352 + 512 + i) === pc+1)?"white":"" };`
    }


    const tick = () => {
        pc = chip8.tick(); 
        registers_trigger++; 
        read_display_trigger++
    }

    
    // setInterval(() => {pc = chip8.tick(); registers_trigger++}, 100)


</script>
<div class="container">

    {#if raw_rom.length > 0}

    <div>
        {rom_name} {raw_rom.length} bytes
    </div>
    <div class="dump">
        {#each raw_rom.slice(page * rows * 16, page*rows*16 + (rows * 16)) as cell, i}
            {#if i%16 == 0}
                <div class="sidebar">{ ((page*rows) + (i / 16)).toString(16).padStart(8, "0")}</div>
            {/if}
            <div id={(page * (16*rows) + 512 + i).toString()} style={generate_css_str(page, i, pc)} >{cell.toString(16).padStart(2, "0")}</div>
        {/each}

    </div>
    <div class="buttons">
        <div>
            <button on:click={() => page === 0 ?page:page--}>previous</button>
            {page}
            <button on:click={() => page === Math.floor(raw_rom.length/(rows*16)) ? page:page++}>next</button>
        </div>
        <div>
            <div>

                <button class="tick" on:click={tick}>
                    tick cpu {curr_inst.toString(16).padStart(4, "0")} | {chip8.convert_inst_to_string(curr_inst)}
                </button>
            </div>
            <div>


            <button class="tick" on:click={() => {
                if (ticker === 0) {
                    ticker = setInterval(tick, 1/ hertz)
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
                registers_trigger++;
                read_display_trigger++;
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
    }

    .tick {
        font-size: 20px;
    }
</style>

