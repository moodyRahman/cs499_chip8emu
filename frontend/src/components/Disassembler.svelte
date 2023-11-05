<script lang="ts">
    export let rom: Uint16Array;
    let page = 0;
    import * as chip8 from "$lib/chip8/debug.js";


    $: rom, page=0

    const inc_page = () => {
        if (page === Math.floor(rom.length / 30) ) {
            page = 0
            return
        }
        page++;
    }

    const dinc_page = () => {
        if (page === 0) {
            page = Math.floor(rom.length / 30)
            return
        }
        page--;
    }

    const swap_endian = (x: number) => {
        return ((x & 0x00ff) << 8 | (x>>8))
    }

</script>

<div>  {rom.length}
    <table cellspacing="0" cellpadding="0">
        <th>
            disassembled
        </th>
        <th>
            word
        </th>
        <th>
            ascii
        </th>
        {#each rom.slice(page*30, (page*30)+30) as inst}
        <tr>
            <td>
                {chip8.convert_inst_to_string(swap_endian(inst))} 
            </td>
            <td>
                {swap_endian(inst).toString(16).padStart(4, "0")}
            </td>
            <td class="ascii">
                {String.fromCharCode(inst & 0x00ff)}{String.fromCharCode(inst >> 8)}
            </td>
        </tr>
        {/each}
    </table>
    <button on:click={dinc_page}>prev page</button>
    {page}
    <button on:click={inc_page}>next page</button>
</div>


<style>
    table {
        text-align: left;
        border: none;
    }

    table > * {
        padding-left: 30px;
    }
    table > * > * {
        padding-left: 30px;
    }
</style>