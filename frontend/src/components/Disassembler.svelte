<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";


    export let raw_rom: Uint8Array = new Uint8Array();
    
    let rom: Uint16Array;
    let page = 0;
    let display: Uint16Array;

    // whenever input rom changes, set page to 0 and generate a new 16bit version, store that to rom
    $: raw_rom, page=0, rom=generateu16(raw_rom)

    // whenever page changes, update display to match page
    $: page, display = rom.slice(page*30, (page*30)+30)

    const generateu16 = (buff: Uint8Array) => {
        const padded_rom = new Uint8Array(buff.byteLength%2 == 0? buff.byteLength:buff.byteLength + 1);
        
        padded_rom.set(buff, 0);


        return new Uint16Array(padded_rom.buffer);
    }

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
        {#each display as inst}
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

        {#if display.length < 30 }
            {#each Array(30-display.length) as x}
                <tr>
                    <td>
                        &nbsp;
                    </td>
                </tr>
            {/each}
        {/if}

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