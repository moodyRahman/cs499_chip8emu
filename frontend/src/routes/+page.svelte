

<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
	import Display from "../components/Display.svelte";
	import Loader from "../components/Loader.svelte";
	import RomDump from "../components/RomDump.svelte";
	import Registers from "../components/Registers.svelte";
	import SingleInstruction from "../components/SingleInstruction.svelte";
	import { debug_mode_store, keypress_store, registers_trigger } from "$lib/stores/cpu_state";
	import { onMount } from "svelte";
    
    import "$lib/css/main.css"
	import SpriteDesigner from "../components/SpriteDesigner.svelte";

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

        // console.log(ram_around_address(100))

    }

    let debug = true;
    debug_mode_store.subscribe((n) => debug = n)


    let active_keys: string[] = []

    const onKeyDown = (e:KeyboardEvent) => {
        if (e.repeat) return;
        if (e.key.length > 1) return;
        chip8.set_key(e.key);
        keypress_store.set(e.key)
        active_keys = [...active_keys, e.key]

        registers_trigger.update((n) => n+1)

    }

    const resetKey = (e: KeyboardEvent) => {
        if (e.repeat) return true
        active_keys = active_keys.filter((x) => x != e.key)
        chip8.set_key(active_keys.at(-1)!?active_keys.at(-1)!:"")
        keypress_store.set(active_keys.at(-1)!?active_keys.at(-1)!:"")
        registers_trigger.update((n) => n+1)

    }


    // let {func: read_all_registers, trigger: read_all_registers_trigger} = bindFunc(() => {return chip8.read_all_registers()})
    // $: read_all_registers(read_all_registers_trigger)

</script>

<div>
    <button on:click={() => debug_mode_store.set(!debug)}>
        toggle debug menu
    </button>
</div>
<div>
    <Loader />
</div>

{#if debug}
<div>
    held down keys with n-key rollover: {active_keys}
    <SingleInstruction />
</div>

<div>
    <Registers />
</div>
{/if}

<div class="lr-container">
    <Display />
    <RomDump />
</div>

{#if debug}
<div>
    <SpriteDesigner />
</div>
{/if}

<svelte:window on:keydown|preventDefault={onKeyDown} on:keyup|preventDefault={resetKey} />


<style>

    .lr-container {
        display: flex;
        height: auto;
        gap: 2%;
    }

    div {
        margin-bottom: 2%;
    }


</style>


