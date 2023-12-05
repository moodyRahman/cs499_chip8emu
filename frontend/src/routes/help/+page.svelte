<script lang="ts">
import header from "$lib/assets/help/header.png"
import loader from "$lib/assets/help/loader.png"
import runner from "$lib/assets/help/runner.png"
import timings from "$lib/assets/help/timings.png"
import debug1 from "$lib/assets/help/debug1.png"
import debug2 from "$lib/assets/help/debug2.png"
import debug3 from "$lib/assets/help/debug3.png"
import debug4 from "$lib/assets/help/debug4.png"
import debug5 from "$lib/assets/help/debug5.png"
import gamepad from "$lib/assets/help/gamepad.png"

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
        <h3>Game Pad</h3>
        <img src={gamepad} alt="help content">
        <p>
            Describes the controls for the current game. The 4 by 4 keypad on the 
            bottom describes how your keyboard maps to the Chip-8. The Chip-8 
            originally was operated via a 4 by 4 hexadecimal keypad, and either 
            pressing the button on the keyboard or by toggling "show chip8 input" 
            will show the actual value that's being inputted into the emulator. 
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
            expose the inner workings of the CPU, such as:
        </p>
        <ul>
            <li><a href="#debug_registers">Registers</a></li>
            <li><a href="#debug_dump">ROM Dump</a></li>
            <li><a href="#debug_editor">Sprite Editor</a></li>
            <li><a href="#debug_assembler">Assembler</a></li>
            <li><a href="#debug_legacy">Legacy Tools</a></li>
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
        <p>
            <code>unlock/lock timings</code>: enables or disables the CPU timing adjustment inputs. <br>
            <code>enable/disable debug mode</code>: toggles debug mode. <br>
            <code>break on chip8 error</code>: enables and disables if the 
            emulator stops execution on internal error.  <br>
            <code>toggle fast debugging</code>: swaps the current CPU timings 
            between the intended execution speed, and the slowed down debugging speed.  <br>
            <code>tick cpu &lt;4 digit number&gt; | &lt;instruction&gt;</code>: 
            displays the bytes <code>pc</code> is pointing at, and their decoded 
            instruction.  <br>
            <code>run game</code>: run the current ROM.  <br>
            <code>reset game</code>: resets the CPU state.  <br>
        </p>
        <!-- <ul>
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
        </ul> -->
    </div>
    
    <div id="debug_editor">
        <h3>Sprite Editor</h3>
        <img src={debug3} alt="help content">
        <p>
            The sprite editor is a small tool to help programmers design sprites 
            for the emulator. It contains a 15x8 grid of buttons you can click on 
            to toggle a pixel. The hex number to the right of each row displays 
            the hex value that corresponds to the row of pixels. The right number 
            keeps track of how many pixels tall this sprite is. 
        </p>
        <p>
            <code>save</code>: will take the current sprite and its name and store 
            it under "saved sprites". Clicking a saved sprite will load it back. <br>
            <code>copy to clipboard</code>: copies the current sprite into a comma 
            separated string of hex numbers, ready to paste into the code editor. 
            <code>load string into sprite</code>: given a comma separated string 
            of hex numbers, load it as a sprite into the editor. <br>
            <code>reset</code>: reset the pixels and the name, and preserves 
            created sprites. 
        </p>
    </div>

    <div id="debug_assembler">
        <h3>Assembler</h3>
        <img src={debug4} alt="help content">
        <p>
            Please see <a href="http://devernay.free.fr/hacks/chip8/C8TECH10.HTM">CowGod's Chip-8 Technical Reference v1.0</a> for the syntax. 
        </p>
        <p>We also implemented some assembler directives to aid you.</p> 
        <p>

            <code>examplelabel:</code>
            Labels can be any alphanumeric string but CANNOT be an integer <br>
    
            <code>.org</code>
            Directive to change address the follow code is mapped at <br>
    
            <code>.text</code>
            Directive to indicate following text is code <br>
    
            <code>.data</code>
            Directive to indicate following text is data <br>
        </p>

        <p>
            <code>assemble</code>: assembles the source code and loads it into the emulator. <br>
            <code>reset</code>: resets the textarea. <br>
            <code>save</code>: stores the current code and CPU timing parameters into a file 

        </p>
    </div>

    <div id="debug_legacy">
        <h3>Legacy Tools</h3>
        <img src={debug5} alt="help content">
        <p>
            The first UI for the emulator, allows you to run arbitrary instructions 
            at any point in the emulation. Draw pixels allows you to draw arbitrary pixels
            to the display. 
        </p>
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

    #debug_editor > img {
        box-shadow: 5px 5px 0px -1px lightblue;
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