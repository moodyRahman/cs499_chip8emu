<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";

    export let registers_trigger: number;

    let registers: Uint16Array;
    $: registers_trigger, registers = chip8.read_all_registers();
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
    <div>
        {#each chip8.ram_around_address(3, 3, registers[32]) as mem}
            <span>
                {mem.toString(16)}
            </span>
            {/each}
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
</style>