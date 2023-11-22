<script lang="ts">


    import * as chip8 from "$lib/chip8/debug.js";
	import { onMount } from "svelte";
    import config from "../cpu_configs";
    import { rom_name as rom_name_store, rom as rom_store } from "$lib/stores/cpu_state";

    let rom: Uint8Array
    rom_store.subscribe((n) => rom = n)


    let name: string = "Pong.ch8"
    let all_roms: string[] = []

    // $: rom_name, loader();

    const loader = async () => {
        console.log(`fetching ${config.backend_url}/assets/roms/${name}`)
        const res = await fetch(`${config.backend_url}/assets/roms/${name}`);
        const buff = await res.arrayBuffer();
        rom_store.set(new Uint8Array(buff));
        rom_name_store.set(name)
        chip8.reset();
        chip8.load_rom(rom);
	}

    onMount(loader)

    const get_rom_names = async () => {
        const res = await fetch(`${config.backend_url}/assets_data`)
        const data: string[] = await res.json()
        all_roms = data.filter((x) => x.includes(".ch8"))
    }

    onMount(get_rom_names)
</script>


<div>
    <div>
        load a rom
    </div>
    <select bind:value={name}>

        <!-- Astrododge.ch8  Breakout.ch8  Landing.ch8  Pong.ch8  Pong2.ch8  SpaceInvaders.ch8  Tetris.ch8  TicTacToe.ch8 -->
        {#each all_roms as option }
            <option value={option}>{option.slice(0, option.indexOf(".ch8"))}</option>
        {/each}
    </select>
    <button on:click={loader}>
        load rom
    </button>
</div>


<style>

</style>