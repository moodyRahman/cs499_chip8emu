<script lang="ts">


    import * as chip8 from "$lib/chip8/debug.js";
	import { onMount } from "svelte";
    export let rom_name: string
    export let rom: Uint8Array

    let name: string

    // $: rom_name, loader();

    const loader = async () => {
        console.log(`fetching http://localhost:3000/assets/roms/${name}`)
        const res = await fetch(`http://localhost:3000/assets/roms/${name}`);
        const buff = await res.arrayBuffer();
        rom = new Uint8Array(buff);
        rom_name = name
        chip8.load_rom(rom);
	}

    onMount(loader)
</script>


<div>
    <div>
        load a rom
    </div>
    <select bind:value={name}>

        <!-- Astrododge.ch8  Breakout.ch8  Landing.ch8  Pong.ch8  Pong2.ch8  SpaceInvaders.ch8  Tetris.ch8  TicTacToe.ch8 -->
        <option value="Astrododge.ch8">Astrododge</option>
        <option value="Breakout.ch8">Breakout</option>
        <option value="Landing.ch8">Landing</option>
        <option value="Pong.ch8">Pong</option>
        <option value="Pong2.ch8">Pong2</option>
        <option value="SpaceInvaders.ch8">SpaceInvaders</option>
        <option value="Tetris.ch8">Tetris</option>
        <option value="TicTacToe.ch8">TicTacToe</option>
        <option value="test_opcode.ch8">test rom</option>


    </select>
    <button on:click={loader}>
        load rom
    </button>
</div>


<style>

</style>