<script lang="ts">


    import * as chip8 from "$lib/chip8/debug.js";
	import { onMount } from "svelte";
    import config from "../cpu_configs";
    import { rom_metadata, rom_name as rom_name_store, rom as rom_store, rom_timings_original, rom_timings, loading, run_game_animation, is_running, display_trigger, type metadata } from "$lib/stores/cpu_state";

    let rom: Uint8Array
    rom_store.subscribe((n) => rom = n)

    let message = ""
    


    let name: string = "SpaceInvaders.ch8"
    let all_roms: string[] = []

    let upload_prompt = false


    let file: FileList;

    // $: rom_name, loader();

    const loader = async () => {
        message = ""
        upload_prompt = false;
        chip8.reset();
        $is_running = false
        $display_trigger++;
        console.log(`fetching ${config.backend_url}/meta_assets/${name}`)

        if (name === "upload your own ROM ") {
            upload_prompt = true;
            return;
        }

        const res = await fetch(`${config.backend_url}/meta_assets/${name}`);
        const data = await res.json()
        const bin_string = atob(data.rom)
        const buff = new Uint8Array(bin_string.length);
        for (var i = 0; i < bin_string.length; i++) {
            buff[i] = bin_string.charCodeAt(i);
        }

        console.log(data)
        rom_metadata.set(data.meta)
        $rom_timings = data.meta.data.timing
        $rom_timings_original = JSON.parse(JSON.stringify(data.meta.data.timing))

        rom_store.set(buff);
        rom_name_store.set(name)
        chip8.reset();
        chip8.load_rom(rom);
        $loading = false
        $run_game_animation = true;
        console.log("done loading")
	}

    onMount(loader)

    const get_rom_names = async () => {
        const res = await fetch(`${config.backend_url}/assets_data`)
        const data: string[] = await res.json()
        all_roms = data.filter((x) => x.includes(".ch8"))
    }

    onMount(get_rom_names)


    const handleLoad = async () => {

        if (file.length === 0) {
            return;
        }
        const buff = new Uint8Array(await file[0].arrayBuffer())

        const meta: metadata = {status: 0, data:{
            description: `${file[0].name}`,
            mapping:[],
            timing:{
                ticks_per_interval: 12,
                time_between_intervals_ms: 8,
                display_rerender_threshold: 12
            }
        }}

        rom_metadata.set(meta)

        
        rom_store.set(buff);
        rom_name_store.set(name)
        chip8.reset();
        chip8.load_rom(rom);
        $loading = false
        $run_game_animation = true;
        console.log("done loading")

    }

</script>


<div class="container">
    <div>
        Select a game to play{message === "" ? "" : ", " + message}
    </div>
    <select bind:value={name} on:change={() => {
        if (name === "load ROM from editor ") return
        loader();
        // setTimeout(() => {
        //     message = ""
        // }, 3000)
        // message = "be sure to click \"run game\" before you play the game"
    }}>

        <!-- Astrododge.ch8  Breakout.ch8  Landing.ch8  Pong.ch8  Pong2.ch8  SpaceInvaders.ch8  Tetris.ch8  TicTacToe.ch8 -->
        {#each [...all_roms, "upload your own ROM "] as option }
            <option value={option}>{option.slice(0, option.indexOf(".ch8"))}</option>
        {/each}
    </select>
    <!-- <button on:click={() => {
        loader();
        message = "now click on run game to start playing!"
        setTimeout(() => {
            message = ""
        }, 3000)
        }}>
        load rom
    </button> -->

    {#if upload_prompt}
        <input bind:files={file} type="file" id="rom_in"/>
        <button on:click={handleLoad} >upload ROM</button>
    {/if}
</div>


<style>

.container {
    margin-top: 20px;
    background-color: lightcoral;
    padding: 1%;
    border-radius: 4px;
    box-shadow: 5px 5px 0px -1px lightblue;
}

select {
    width: 100%;
    font-size: 1.1rem;
}

</style>