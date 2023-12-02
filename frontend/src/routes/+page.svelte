

<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
	import Display from "../components/Display.svelte";
	import Loader from "../components/Loader.svelte";
	import RomDump from "../components/RomDump.svelte";
	import Registers from "../components/Registers.svelte";
	import SingleInstruction from "../components/SingleInstruction.svelte";
	import SpriteDesigner from "../components/SpriteDesigner.svelte";
	import { audio_store, debug_mode_store } from "$lib/stores/cpu_state";
	import { onMount } from "svelte";

    
    import "$lib/css/main.css"
	import Editor from "../components/Editor.svelte";
	import GamePad from "../components/GamePad.svelte";
	import MessageBoard from "../components/MessageBoard.svelte";

    const load_wasm_binary = async () => {
        const res = await fetch("http://localhost:3000/assets/roms/debug.wasm")
        const wasmBinary = await res.arrayBuffer()
        const imports = {
            env: {
                memoryBase: 0,
                tableBase: 0,
                memory: new WebAssembly.Memory({ initial: 256 }),
                table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
                abort: (msg: any, file: any, line: any, column: any) => {
                    console.error(`Error in WebAssembly module: ${msg} at ${file}:${line}:${column}`);
                },
                "console.log": (message: any) => {
                    console.log(message);
                },
                seed: () => {
                    // Implement the seed function logic here
                    const seed = Math.floor(Math.random() * 1000);
                    return seed
                },

            },

        }

        const { instance, module } = await WebAssembly.instantiate(wasmBinary, imports);
        const {
            memory,
            read_instruction,
            read_all_registers,
            ram_around_address,
            display,
            debug_set_pixel,
            load_rom,
            read_mem,
            tick,
            reset,
            ram_dump,
            convert_inst_to_string,
            draw,
            read_display,
            init,
            buffer,
            add,
            add_internal,
            read_internal,
        } = instance.exports

    }

    let debug = true;
    debug_mode_store.subscribe((n) => debug = n)


    let active_keys: string[] = []

    let audio = false;
    audio_store.subscribe((n) => audio = n)


    // let {func: read_all_registers, trigger: read_all_registers_trigger} = bindFunc(() => {return chip8.read_all_registers()})
    // $: read_all_registers(read_all_registers_trigger)

</script>

<div>
    <Loader />
</div>

{#if debug}
<div>
    <SingleInstruction />
</div>
{/if}

<div class="lr-container">
    <div class="register">
        <Registers />
    </div>
    {#if debug}
        <SpriteDesigner />
    {/if}
</div>

<div class="lr-container">
    <Display />
    <div>
        <RomDump />
        <MessageBoard />
        <GamePad />
    </div>
</div>

{#if debug}
    <Editor />
{/if}


<style>

    .lr-container {
        display: flex;
        height: auto;
        gap: 2%;
    }

    .register {
        align-self: flex-end;
    }

    div {
        margin-bottom: 1%;
    }


</style>


