<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";


    export let raw_rom: Uint8Array = new Uint8Array();
    export let rom_name: string;
    
    let rom: Uint16Array;  // internal copy of the ROM
    let page = 0;  // current viewing page
    let display: Uint16Array;  // slice of rom of length height
    
    let pc: number = 512;

    // memory of arbitrary ram address to read
    let arbit = 0

    const height = 30;

    let mode:string = "read"
    let highlight = 0;

    let off_one_toggle=false;  // display offset ROM (odd addresses) toggle

    $: mode, handleTick()

    // whenever input rom changes, set page to 0 and generate a new 16bit version, store that to rom
    $: raw_rom, page=0, rom=generateu16(raw_rom)

    // whenever we toggle offset ROM mode, reload rom with offset enabled or disabled
    $: off_one_toggle, rom = off_one_toggle?odd_generateu16(raw_rom):generateu16(raw_rom)

    // whenever page changes, update display to match page
    $: page, display = rom.slice(page*height, (page*height)+height), console.log("lalala")


    const generateu16 = (buff: Uint8Array) => {
        const padded_rom = new Uint8Array(buff.byteLength%2 == 0? buff.byteLength:buff.byteLength + 1);        
        padded_rom.set(buff, 0);
        return new Uint16Array(padded_rom.buffer);
    }

    const odd_generateu16 = (buff: Uint8Array) => {
        if (buff.length == 0)
        {
            return new Uint16Array()
        }
        const padded_rom = new Uint8Array(buff.byteLength%2 == 0? buff.byteLength + 2:buff.byteLength+3)
        padded_rom.set(buff, 1);
        return new Uint16Array(padded_rom.buffer);
    }

    const inc_page = () => {
        if (page === Math.floor(rom.length / height) ) {
            page = 0
            return
        }
        page++;
        mode="read"
    }

    const dinc_page = () => {
        if (page === 0) {
            page = Math.floor(rom.length / height)
            return
        }
        page--;
        mode = "read"
    }

    const swap_endian = (x: number) => {
        return ((x & 0x00ff) << 8 | (x>>8))
    }

    const handleTick = () => {
        if (mode === "debug") {
            const rel_add = Math.floor(pc-512)
            if (rel_add % 2 === 0) {
                
            }
            highlight = Math.floor(rel_add%height / 2)
            page = Math.floor(rel_add/height)

            console.log("lets look at ", highlight, page)
        }
    }

</script>
{#if rom.length === 0}
loading rom...
{:else}
<div>
    <button on:click={() => off_one_toggle = !off_one_toggle} >odd offset: {off_one_toggle?"ON":"OFF"}</button> 
    <button on:click={() => mode = mode==="read"?"debug":"read"} >debug mode: {mode}</button>
    viewing: {rom_name} {raw_rom.length} bytes
    <table cellspacing="0" cellpadding="0">
        <th>
            #
        </th>
        <th>
            disassembled
        </th>
        <th>
            word
        </th>
        <th>
            ascii
        </th>
        {#each display as inst, line}
        <tr style={ mode==="read"?"":(line === highlight? "background-color: black; color: white":"")} >
            <td>
                {((height*page) + 512 + (line*2) - (off_one_toggle?1:0) ).toString(16)}
            </td>
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

        {#if display.length < height }
            {#each Array(height-display.length) as x}
                <tr>
                    <td>
                        &nbsp;
                    </td>
                </tr>
            {/each}
        {/if}

    </table>
    <div>

        <button on:click={dinc_page}>prev page</button>
        {page}
        <button on:click={inc_page}>next page</button>
    </div>
    <div>
        read from rom: <input type="number" bind:value={arbit}> {chip8.read_mem(arbit).toString(16)}
    </div>
    <div>
        <button on:click={() => {pc = chip8.tick(); console.log("pc is at ", pc.toString(16)), handleTick()}} class="tick">tick cpu {pc.toString(16)}</button>
    </div>
</div>
{/if}


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

    .tick {
        font-size: 25px;
    }
</style>