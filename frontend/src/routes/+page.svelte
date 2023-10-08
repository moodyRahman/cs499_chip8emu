

<script lang="ts">

import * as chip8 from "$lib/chip8/debug.js";

    const bindFunc = (wasmfunc: CallableFunction) => {    
        return {
            func: (_trigger: number) => {  
                return wasmfunc()
            },
            trigger: 0
        }
    }
    
    
    let input = ""    
    let register = 0

    let {func: read_instruction, trigger: read_instruction_trigger} = bindFunc(() => {console.log(input);register = chip8.read_instruction(Number(input))})    
    $: read_instruction(read_instruction_trigger)
    
</script>



<div>
    {register}
</div>

<div>
    <input type="text" placeholder="enter instruction here" bind:value={input}>
</div>

<div>
    <button on:click={() => {read_instruction_trigger++}}>run the instruction</button>
</div>
