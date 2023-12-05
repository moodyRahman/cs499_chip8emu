<script lang="ts">
import assemble from "$lib/assembler/assembler";
import { rom, rom_metadata, rom_name, rom_timings, run_game_animation, sprites_array } from "$lib/stores/cpu_state";
import { onMount } from "svelte";
import * as chip8 from "$lib/chip8/debug.js";


let code = ""
let err = ""
let name = ""
let file_out = ""

let editor_prop: any

const handleAssemble = () =>{
    console.log(code)

    try {
        $rom = assemble(code)
        $rom_name = name
        $rom_metadata = {
            status: 0,
            data: {
                description: 'custom ROM',
                mapping: [],
                timing: {
                    ticks_per_interval: 8,
                    time_between_intervals_ms: 8,
                    display_rerender_threshold: 8
                }
            }
        }

        chip8.reset();
        chip8.load_rom($rom);
        $run_game_animation = true;

        

        err = ""
        
    } catch (error: any) {
        err = error.message
        if (error.message.includes("line"))
        {
            let number_i = (error.message.split(" ").findIndex((x: any) => /line/.test(x))) + 1
            let dirty_line_no = error.message.split(" ")[number_i]
            let clean_line_no = Number(dirty_line_no.replace(/\D/g, ''))
            
            let lines = code.split("\n").slice(0, clean_line_no)
            console.log(lines)
            let offset = lines.reduce((sum, curr) => {
                return sum + curr.length + 1
            }, 0)
            editor_prop.selectionStart = offset - 1;

            editor_prop.selectionEnd = offset - 1;
            editor_prop.focus();
        }

    }
}

let save_dialog: any;
let load_dialog: any;

let out_string = ""
let in_string = ""
const handleSave = () => {
    
    let out = {
        timings:{...$rom_timings},
        name: name,
        data: code,
        sprites: $sprites_array
    }
    out_string = btoa(JSON.stringify(out))
    save_dialog.showModal()
}

const handleLoad = () => {
    load_dialog.showModal()
}

const b64_to_state = () => {
    load_dialog.close()
    let data:{
        timings: any,
        name: string,
        data: string,
        sprites: any
    } = JSON.parse(atob(in_string))

    code = data.data
    name = data.name
    $sprites_array = structuredClone(data.sprites)
    $rom_timings = structuredClone(data.timings)

    console.log(data)
}

const handleReset = () => {
    name = ""
    code = ""
}

onMount(() => {
    save_dialog = document.querySelector("#save");
    load_dialog = document.querySelector("#load");
})

/**

*/

</script>


<div class="container">
    <dialog id="save">
        <div>
            <button on:click={save_dialog.close()}>x</button>
        </div>
        <div>
            please copy this string! this contains your source code, name, and CPU timing parameters <br> <br>
        </div>
        <div class="modal">
            {out_string}
        </div>

    </dialog>

    <dialog id="load">
        <div>
            <button on:click={save_dialog.close()}>x</button>
        </div>
        <div>
            paste in your save
            <textarea bind:value={in_string}></textarea>
        </div>
        <button on:click={b64_to_state} >load</button>
    </dialog>


    <div class="editor-ui">
        <div class="name">
            file name <input type="text" bind:value={name}>
        </div>
        <div>
            <button on:click={handleAssemble}>assemble</button> 
            <button on:click={handleReset}>reset</button> 
            <button on:click={handleSave}>save</button> 
            <button on:click={handleLoad}>load</button>
        </div>
        <div class="editor">
            <textarea bind:value={code} bind:this={editor_prop} />
        </div>
        <!-- <div id="editor">lalala</div> -->
    </div>
    <div class="message">
        {err} <br>
    </div>
</div>


<style>
    textarea {
        width: 85%;
        height: 500px;
    }

    .name {
        margin-top: 5px;
    }

    .modal {
        word-wrap: break-word;
        font-family: monospace;
        border: 1px solid black;
        padding: 10px;
    }

    .container {
        display:flex;
        gap: 2%;
        width: 90%;
    }

    .editor-ui {
        flex-basis: 50%;
    }

    .editor {
        display: flex;
        flex-direction: row;
    }

    .message {
        margin-top: 2%;
    }
</style>
