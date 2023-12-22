<a name="readme-top"></a>


<!-- PROJECT LOGO -->


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About sv8

<h3>
<a href="https://chip8.moodyrahman.com">https://chip8.moodyrahman.com</a>
</h3>
  <p>
    sv8 is an emulator for the Chip-8, an interpreted programming language made in 
    the 1970's. sv8 features: 
  </p>
  <ul>
    <li>3.5 kilobytes of usable RAM</li>
    <li>16 general use registers</li> 
    <li>a function stack depth of 12</li> 
    <li>1 bit sound</li>
    <li>highscore boards for certain games</li>
    <li>and a dazzling 64x32 1 bit display</li>
    
  </ul>
  <p>
    Alongside the emulator, is a suite of tools to aid in development for the Chip-8. 
    The UI features 
  </p>
  <ul>
    <li>live view of all the registers in the CPU</li>
    <li>displays RAM around the program counter</li>
    <li>adjustable timing parameters to speed up or slow down the CPU</li>
    <li>a hex dump of the current program running with the current instruction highlighted</li>
    <li>pagination of the hexdump for ease of viewing</li>
    <li>a sprite editor that converts drawings to their corresponding binary representation</li>
    <li>a text editor that allows for writing, compiling, and running code all in the browser</li>
  </ul>



### Built With

* SvelteKit
* AssemblyScript
* WebAssembly
* ExpressJS
* SQLite
* Howler.js
