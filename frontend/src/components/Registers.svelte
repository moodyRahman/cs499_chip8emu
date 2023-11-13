<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
	import { base_store, registers_trigger } from "$lib/stores/cpu_state";

    import config from "../cpu_configs";

    let trigger: number;

    registers_trigger.subscribe((n) => {
        trigger = n;
    })

    let registers: Uint16Array;
    $: trigger, registers = chip8.read_all_registers();

    // controls how many bytes of memory adjacent to the program counter to display
    let pc_highlight_index = config.ram_adjacent_to_pc;

    let base: number;

    base_store.subscribe((n) => base = n);
</script>

<div>
    registers <button on:click={() => base_store.set(base === 16?10:16)}>displaying base {base}</button>
    <div class="registers">
        {#each registers.slice(0, 16) as register, i}
            <span class="register">V{i.toString(base)} {register.toString(base)}  </span>
        {/each}
    </div>
    <div>
        {#each registers.slice(16, 32) as register, i}
            <span class="register">S{i.toString(base)} {register.toString(base)}  </span>
        {/each}
    </div>
    <div>
        <span class="register">pc: {(registers[32]).toString(base)}</span>
        <span class="register">sp: {registers[33].toString(base)}</span>
        <span class="register">index: {registers[34].toString(base)}</span>
        <span class="register">dt: {registers[35].toString(base)}</span>
    </div>
    data adjacent to PC
    <div>
        {#each chip8.ram_around_address(pc_highlight_index, pc_highlight_index+1, registers[32]) as mem, i}
            {#if i == pc_highlight_index || i == pc_highlight_index + 1}
                <span class="highlight adjacent">
                    {mem.toString(base).padStart(2, "0")}
                </span>
            {:else}
            <span class="adjacent">
                {mem.toString(base).padStart(2, "0")}
            </span>
            {/if}

            
            {/each}
        </div>
        <div>
            {chip8.convert_inst_to_string(((chip8.ram_around_address(pc_highlight_index, pc_highlight_index, registers[32])[pc_highlight_index] << 8) | chip8.ram_around_address(pc_highlight_index, pc_highlight_index, registers[32])[pc_highlight_index+1]))}
        </div>
    </div>

<style>
    .registers {
        width: 50%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
    .register {
        margin-left: 10px;
    }

    .highlight {
        background-color: black;
        color: white;
    }

    .adjacent {
        margin-left: 5px;
        padding: 2px;
    }
</style>