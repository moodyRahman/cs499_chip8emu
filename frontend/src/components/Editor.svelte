<script lang="ts">
import assemble from "$lib/assembler/assembler";
	import { rom, rom_metadata, rom_name } from "$lib/stores/cpu_state";
import { onMount } from "svelte";

let code = ""
let err = ""
let name = ""

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

onMount(() => {
    console.log(editor_prop)
})

</script>


<div class="container">
    <div class="editor-ui">
        <div>
            code editor
            <button on:click={handleAssemble}>assemble</button> 
            <button>reset</button> 
            <button>save</button> 
            <button>load</button>
        </div>
        <div>
            name: <input type="text" bind:value={name}>
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
