<script lang="ts">
import header from "$lib/assets/help/header.png"
import loader from "$lib/assets/help/loader.png"
import runner from "$lib/assets/help/runner.png"
import timings from "$lib/assets/help/timings.png"
import debug1 from "$lib/assets/help/debug1.png"
import debug2 from "$lib/assets/help/debug2.png"
import debug3 from "$lib/assets/help/debug3.png"
import debug4 from "$lib/assets/help/debug4.png"

import { implemented_games } from "$lib/highscore";

</script>

<div>

    <div>

        <h3>Navigation Bar</h3>
        <img src={header} alt="help content">
        <p>
            Fairly self explanatory, buttons to navigate sv8. 
        </p>
    </div>

    <div>

        <h3>ROM Loader</h3>
        <img src={loader} alt="help content">
        <p>
            Click on the dropdown box to select the ROM you want to run, then click on "load rom".
        </p>
    </div>

    <div>
        <h3>CPU Controls</h3>
        <img src={runner} alt="help content">
        <ul>
            <li>run game: will start running the currently loaded ROM.</li>
            <li>reset game: will reset the CPU.</li>
            <li>Certain games have a highscore board implemented:</li>
            <ul>
                {#each implemented_games as game}
                <li>
                    {game}
                </li>
                {/each}
            </ul>
            <li><a href="#cpu_timings">unlock (cpu) timings</a></li>
            <li><a href="#debug_mode">debug mode</a></li>

        </ul>
    </div>
    
    <div id="cpu_timings">
        <h3>CPU Timings</h3>
        <img src={timings} alt="help content">
        <p>These three values are what control the speed at which the CPU runs at. </p>
        <ul>
            <li>Ticks per Interval: how many CPU ticks does it queue up ever "time between intervals" </li>
            <li>Time between Intervals: how many milliseconds between each batch of CPU ticks, with a effective minimum of 4ms</li>
            <li>
                Display Rerender Threshold: How many CPU ticks must execute 
                before we rerender the display. Should be kept to either 1 or the same vale as 
                Ticks per Interval. 
            </li>
        </ul>
    </div>

    <div id="debug_mode">
        <h3>Debug Mode</h3>
        <p>
            One of the things that set sv8 apart from other Chip-8 emulators is the 
            debug mode. Enabling debug mode will slow the CPU down to 10 hertz, and 
            expose the inner workings of the CPUm, such as:
        </p>
        <ul>
            <li><a href="#debug_registers">Registers</a></li>
            <li><a href="#debug_dump">ROM Dump</a></li>
            <li><a href="#debug_editor">Sprite Editor</a></li>
            <li><a href="#debug_assembler">Assembler</a></li>
        </ul>
    </div>

    <div id="debug_registers">
        <h3>Registers</h3>
        <img src={debug1} alt="help content">
        <p>
            Displays all of the CPU registers in sv8 as the code is ran. There are 
            16 general purpose registers, known as the <code>V</code> registers. They range from 
            <code>V0</code> to <code>Vf</code>. <code>Vf</code> is often used as a CPU flag, 
            and should not be used in user programs. sv8 also has a function stack 
            16 deep, allowing for up to 16 nested subroutine calls. The return addresses 
            for each subroutine is stored in <code>S0</code> to <code>Sf</code>. 
        </p>
        <p>
            <code>pc</code> stands for the program counter, <code>sp</code> is a reference to the top of 
            the function stack, <code>index</code> is a special register used to store addresses.
            <code>dt</code> and <code>st</code> are special registers that decrement 
            by 1, 60 times a  second. Be wary when debugging programs that make 
            use of these registers, as debugging with a slow timing may cause 
            undesired behavior.  
        </p>
        <p> 
            <code>data adjacent to PC</code> is a special utility that displays 
            a live view of the RAM around wherever the program counter may be.  
        </p>
    </div>

    <div id="debug_dump">
        <h3>ROM Dump</h3>
        <img src={debug2} alt="help content">
        <p>
            This panel displays the ROM as a hexdump. The left most column shows 
            what address in RAM this byte is located, with a star for the one's place. 
            The topmost row displays the offset from the base address at the left. 
            The bytes that <code>pc</code> is pointing at are highlighted, and the tick 
            button displays waht instruction those bytes corresponds to. At the bottom 
            of the ROM dump are pagination buttons that let you scroll through the source. 
            As the ROM executes, the ROM dump with auto-paginate so <code>pc</code> 
            is always visible. 
        </p>

        <p>
            "ticks per interval", "time between intervals" and "display rerender threshold" 
            are in reference to <a href="#cpu_timings">CPU timings</a>. 
        </p>

        <p>The purpose of each button is as follows:</p>
        <ul>
            <li>
                <code>unlock/lock timings</code>: enables or disables the CPU timing adjustment inputs.
            </li>
            <li>
                <code>enable/disable debug mode</code>: toggles debug mode.
            </li>
            <li>
                <code>break on chip8 error</code>: enables and disables if the 
                emulator stops execution on internal error. 
            </li>
            <li>
                <code>toggle fast debugging</code>: swaps the current CPU timings 
                between the intended execution speed, and the slowed down debugging speed. 
            </li>
            <li>
                <code>tick cpu &lt;4 digit number&gt; | &lt;instruction&gt;</code>: 
                displays the bytes <code>pc</code> is pointing at, and their decoded 
                instruction. 
            </li>
            <li>
                <code>run game</code>: run the current ROM. 
            </li>
            <li>
                <code>reset game</code>: resets the CPU state.
            </li>
        </ul>
    </div>
</div>

<style>

    img {
        border: 1px solid lightcoral;
        border-radius: 4px;
        box-shadow: 5px 5px 0px -1px lightcoral;
        width:auto;
        overflow:hidden
    }

    div > div {
        outline: 2px solid black;
        width: 60%;
        margin-top: 2%;
        padding: 1%;
        border-radius: 4px;
        box-shadow: 10px 10px 0px -1px black;
    }

    code {
        font-weight: bold;
        font-style: italic;
        font-size: 1rem;
    }

</style>