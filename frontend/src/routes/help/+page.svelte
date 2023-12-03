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
            <li><a href="#cpu_timings">CPU Timings</a></li>
            <li><a href="#debug_mode">Debug Mode</a></li>

        </ul>
    </div>
    
    <div id="cpu_timings">
        <h3>CPU Timings</h3>
        <img src={timings} alt="help content">
        <p>These three values are what control the speed at which the CPU runs at. </p>
        <ul>
            <li>Ticks per Interval: how many CPU ticks does it queue up ever "time between intervals" </li>
            <li>Time between Intervals: how many milliseconds between each batch of CPU ticks, with a effective minimum of 4ms</li>
            <li>Display Rerender Threshold: </li>
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
            <li>Registers</li>
            <li>ROM Dump</li>
            <li>Sprite Editor</li>
            <li>Assembler</li>
        </ul>
    </div>
</div>

<style>

    img {
        border: 1px solid lightcoral;
        border-radius: 4px;
        box-shadow: 5px 5px 0px -1px lightcoral;
    }

    div > div {
        outline: 2px solid black;
        width: 60%;
        margin-top: 2%;
        padding: 1%;
        border-radius: 4px;
        box-shadow: 10px 10px 0px -1px black;
    }


</style>