<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";

    import config from "../cpu_configs";

    export let registers_trigger: number;

    let registers: Uint16Array;
    $: registers_trigger, registers = chip8.read_all_registers();

    // controls how many bytes of memory adjacent to the program counter to display
    let pc_highlight_index = config.ram_adjacent_to_pc;
</script>

<div>
    registers
    <div class="registers">
        {#each registers.slice(0, 16) as register, i}
            <span class="register">V{i.toString(16)} {register.toString(16)}  </span>
        {/each}
    </div>
    <div>
        {#each registers.slice(0, 16) as register, i}
            <span class="register">S{i.toString(16)} {register.toString(16)}  </span>
        {/each}
    </div>
    <div>
        <span class="register">pc: {registers[32]}</span>
        <span class="register">sp: {registers[33]}</span>
        <span class="register">index: {registers[34]}</span>
        <span class="register">dt: {registers[35]}</span>
    </div>
    data adjacent to PC
    <div>
        {#each chip8.ram_around_address(pc_highlight_index, pc_highlight_index, registers[32]) as mem, i}
            {#if i == pc_highlight_index}
                <span class="highlight adjacent">
                    {mem.toString(16).padStart(2, "0")}
                </span>
            {:else}
            <span class="adjacent">
                {mem.toString(16).padStart(2, "0")}
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