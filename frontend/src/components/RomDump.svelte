<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
	import { base_store, debug_mode_store, display_trigger, keypress_store, registers_trigger, rom, rom_name as rom_name_store, rom_timings, rom_timings_original } from "$lib/stores/cpu_state";
	import { onMount } from "svelte";

    import config from "../cpu_configs";



    // Loader is what defines the raw_rom, this component waits for that data
    let raw_rom: Uint8Array = new Uint8Array();
    rom.subscribe((n) => {
        raw_rom = n;
    })

    let rom_name: string;
    rom_name_store.subscribe((n) => rom_name = n)


    // $: rom_name, (() => {
    //     local_timing.display_rerender_threshold = $rom_timings.display_rerender_threshold
    //     local_timing.time_between_intervals_ms = $rom_timings.time_between_intervals_ms
    //     local_timing.ticks_per_interval = $rom_timings.ticks_per_interval
    // })()

    let debug: boolean = false;
    debug_mode_store.subscribe((n) => debug = n)

    
    let cpu_ticks = 0;  // keeps track of how many cpu cycles have been executed
    
    let register_ticks = 0;
    registers_trigger.subscribe((n) => {
        register_ticks = n;
    })

    let pc = 512;
    let page = 0;

    // set the cpu cycles per second, extract the data from the config
    // if we're in debug mode, use the debug timings for the CPU


    let rows = config.rom_dump_display_rows;

    let base: number;
    base_store.subscribe((n) => base = n);


    let keypress: string;
    keypress_store.subscribe((n) => keypress = n)

    // id of the setinterval that's ticking the cpu, set to 0 when cpu should stop ticking
    let ticker = 0;
    let paused = false;  // is the cpu waiting for input? if so
    let is_running = false;  // is the cpu auto-running?

    $: curr_inst = (raw_rom?(raw_rom[pc - 512] << 8 | raw_rom[pc - 512 + 1]):0)
    $: raw_rom, pc = 512, page = 0  // if raw_rom changes, reset PC and page

    // given the current page, row, and PC, calculate if a given cell should be highlighted or not
    const generate_css_str = (page: number, i: number, pc: number) => {
        return `background-color:${((page * (16*rows) + 512 + i) === pc || (page * (16*rows) + 512 + i) === pc+1)?"black":"" };` + 
        `color:${((page * (16*rows) + 512 + i) === pc || (page * (16*rows) + 512 + i) === pc+1)?"white":"" };`
    }


    // MAIN EVENT LOOPS


    // 60 times a second, decrement the sound and delay timers
    setInterval(() => {
        chip8.decrement_timers();
    }, 17)

    // assume 
    let main_loop_id = setInterval(() => n_tick($rom_timings.ticks_per_interval), $rom_timings.time_between_intervals_ms)

    // if debug mode changes, kill the main event loop and create a new one with 
    // the desired timing
    $: debug, $rom_timings.time_between_intervals_ms, $rom_timings.display_rerender_threshold, $rom_timings.ticks_per_interval, (() => {
        clearInterval(main_loop_id)
        console.log("adjusting the timing: ", $rom_timings.ticks_per_interval, $rom_timings.time_between_intervals_ms, $rom_timings.display_rerender_threshold)
        main_loop_id = setInterval(() => n_tick($rom_timings.ticks_per_interval), $rom_timings.time_between_intervals_ms)
    })()

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // logic to always execute for a tick
    const tick_raw = async () => {
        /**
        WARNING: THIS CODE RELIES ON CHIP8 ROM'S NOT EDITING THEMSELVES, AS IT REFERS 
        TO A COPY OF THE ROM STORED ON THE FRONTEND- NOT THE ACTUAL DATA IN RAM
        */
        if (paused) return    // if we're waiting for keyboard input, DO NOT TICK
        if ((raw_rom[pc-512] << 8 | raw_rom[pc-512 + 1]).toString(16).match(/f[a-f0-9]0a/))  // if the current instruction is one that's waiting for keyboard input
        {
            paused = true;  // prevent any further ticks from the main event loop from firing
            while (paused)
            {
                await sleep(100)
                if (keypress !== "")
                {
                    break;
                }
            }
            paused = false // release the lock, the next tick will succeed
        }


        // delete from here
        let old_pc = pc;
        if (debug)
        {
            try {
                pc = chip8.tick();  // extract the PC from the emulator itself
            } catch (e: any) {
                console.log( old_pc, chip8.convert_inst_to_string(raw_rom[old_pc - 512] << 8 | raw_rom[old_pc - 512 + 1]), cpu_ticks, e.message)
                error = `error: pc: ${old_pc}, inst: ${chip8.convert_inst_to_string(raw_rom[old_pc - 512] << 8 | raw_rom[old_pc - 512 + 1])}, ${e.message}`
                if (break_on_chip8_error)
                {
                    is_running = false;
                }
            }
        }
        else {
            pc = chip8.tick()
        }
        // until here when we're done with chip8 debugging
        // replace with
        // pc = chip8.tick()


        cpu_ticks++;
        page = Math.floor((pc - 512)/(rows*16)); // calculate the page this tick is on
        registers_trigger.update((n) => n+1); // send out an update for anything that listens to the cpu registers

        if (cpu_ticks % $rom_timings.display_rerender_threshold === 0)  // figure out on which cpu_ticks to we rerender the display
        {
            display_trigger.update((n) => n+1)
        }
    }


    // this is what we're running all the time in the background, the variables 
    // is_running and is_paused control whether or not the tick actually executes
    const tick = () => {
        if (!is_running) return
        tick_raw();
    }

    const n_tick = (n: number) => {
        for (let x = 0; x < n; x++)
        {
            tick();
        }
    }

    const reject_alpha = (e: KeyboardEvent) => {
        if (e.key==="Backspace" || e.key==="ArrowLeft" || e.key==="ArrowRight" || e.key=="Tab") return
        if (!e.key.match(/^\d+$/)) {
            e.preventDefault()
        }
    }



    // delete if performance issues
    let duration = 0;
    let reading_duration = false;
    let hz_display = 0

    setInterval(() => {
        if (!is_running) return
        if (paused) return
        duration += 0.2
    }, 200)


    // smoothes the hz number we display to update only once a second
    setInterval(() => {
        hz_display = cpu_ticks / duration;
    }, 1000)


    let break_on_chip8_error = false;
    let error = "no emulator errors"


    let edit_timing = false

</script>
<div class="container">


    {#if raw_rom.length > 0}
    <div>
        currently loaded ROM: {rom_name} {raw_rom.length} bytes
    </div>
    <span>
        current hz: {(hz_display).toFixed(2)}
    </span>
    <span>
        instructions ran: {cpu_ticks}
    </span>
    {#if debug}
    <span>
        {error}
    </span>
    {/if}
<div>
    <div>

        {#if edit_timing}
        <div>
            ticks per interval: <input type="number" bind:value={$rom_timings.ticks_per_interval} on:keydown={reject_alpha} >
        </div>
        <div>
            time between intervals in ms: <input type="number" bind:value={$rom_timings.time_between_intervals_ms} >
        </div>
        <div>
            display rerender threshold: <input type="number" bind:value={$rom_timings.display_rerender_threshold} >
        </div>
        {/if}
    </div>

    <div>
        <button on:click={() => edit_timing = !edit_timing}>{edit_timing?"lock":"unlock"} timings</button> 
        <button on:click={() => {
            $debug_mode_store = !$debug_mode_store
            if ($debug_mode_store) {
                edit_timing = true;
                $rom_timings.ticks_per_interval = 1;
                $rom_timings.display_rerender_threshold = 1;
                $rom_timings.time_between_intervals_ms = 100;
            }
            else {
                const {ticks_per_interval: tps, display_rerender_threshold: drt, time_between_intervals_ms: tbim} = $rom_timings_original
                console.log("we're disabling the debug mode")
                console.log("this one should not be changing: ", $rom_timings_original)
                $rom_timings.ticks_per_interval = tps
                $rom_timings.display_rerender_threshold = drt
                $rom_timings.time_between_intervals_ms = tbim
            }

        }}>{$debug_mode_store?"disable":"enable"} debug mode</button>
    </div>
    
</div>
    {#if debug}
    <span>
        <button on:click={() => break_on_chip8_error = !break_on_chip8_error}>
            break on chip8 error: {break_on_chip8_error}
        </button>
        <button on:click={() => {
            $rom_timings.ticks_per_interval = $rom_timings.ticks_per_interval
            $rom_timings.time_between_intervals_ms = $rom_timings.time_between_intervals_ms
            $rom_timings.display_rerender_threshold = $rom_timings.display_rerender_threshold
        }}>
            enable fast debugging
        </button>
    </span>
    <!-- 
        rendering the romdump works as follows:
        div.dump is a css grid that's defined to have 17 columns
                                          [max-content] [1fr] [1fr]...[1fr][1fr]
                                         |--------------------------------------|
                                                       17 long
                                         |--------------------------------------|
                                          [sidebar] [data] [data]...[data][data]
     -->
        <div class="dump"> 
            <!-- first render the header (address offsets) -->
            {#each ["address/offset", ...([...Array(16)].map((x, i) => (i).toString(base))) ] as x, i}

            <div class="offset">
                {x}
            </div>
            {/each}

            <!-- calculate which bytes of the rom we should be displaying and slice that -->
            {#each raw_rom.slice(page * rows * 16, page*rows*16 + (rows * 16)) as cell, i}
            <!-- every 17th loop should render a sidebar -->
                {#if i%16 == 0}
                    <div class="sidebar">{ (32+((page*rows) + ((i / 16)))).toString(16).padStart(7, "0").padEnd(8, "*")}</div>
                {/if}

                <!-- render the data in the byte, left padded and calculate if this data is the data at pc -->
                <div id={(page * (16*rows) + 512 + i).toString()} style={generate_css_str(page, i, pc)} >{cell.toString(base).padStart(2, "0")}</div>

            {/each}

            <!-- 
                render some additional blank spaces so that there's an even number of
                cells always in display and the UI doesnt jump around
            -->
            {#if page === Math.floor(raw_rom.length/(rows*16))}
                {#each Array((((page+1)*(rows*16)) - raw_rom.length) + Math.floor((((page+1)*(rows*16)) - raw_rom.length)/16 ) ) as x }
                    <div>
                        &nbsp;
                    </div>
                {/each}
            {/if}
            
        </div>
    {/if}
    <div class="buttons">
        <!-- only in debug mode do we display romdump pagination -->
        {#if debug}
            <div>
                <button on:click={() => page === 0 ?page:page--}>previous</button>
                {page}
                <button on:click={() => page === Math.floor(raw_rom.length/(rows*16)) ? page:page++}>next</button>
            </div>
        {/if}
        
        <div>
            <div>
                <!-- debug mode single tick button should display the instruction we're about to run -->
                {#if debug}
                    <button class="tick" on:click={tick_raw}>
                        tick cpu {curr_inst.toString(16).padStart(4, "0")} | {chip8.convert_inst_to_string(curr_inst)}
                    </button>
                {/if}

            </div>
            <div>

            <!-- 
                change the running state so that the main event loop that's
                constantly firing ticks will actually successfully send ticks
            -->
            <button class="tick" on:click={() => {
                    is_running = !is_running;
                }}>
                    {is_running?"pause":"run"} game
            </button>

            <button class="tick" on:click={() => {
                chip8.reset();
                registers_trigger.set(0);
                display_trigger.set(0)
                pc = 512;
                page = 0;
                paused = true;    //unsure if this is necessary, keeping it here just in case
                clearInterval(ticker)
                ticker = 0
                paused = false;
                is_running = false;
                cpu_ticks = 0;
                duration = 0;
            }}>
                reset game
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

