<div>

  <div>


  <h1>
    What is sv8?
  </h1>
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
</div>

<div>

  <h1>The Technical Stack</h1>
  <p>

    There are three main components to sv8, the frontend, backend,
    and our emulator. 
  </p>
  <p>
    The frontend is implemented in Svelte, a new framework
    that prides itself on its succinctness. It compiles code into bundles that are a 
    fraction of the size than what other frameworks produce, and eliminates the need 
    for a virtual DOM in this compilation step. This results in much faster performance
    compares to other frameworks, which is key to building our emulator. Our target for
    performance was to hit ~2,000 hertz (instructions/second), and given that we want 
    to run it wholly in the browser, we'd need to opt for performance wherever we can. 
  </p>
  <p>
    The emulator is implemented in AssemblyScript, which we compile to a WebAssembly 
    binary. While AssemblyScript may look like another dialect of TypeScript, it's 
    still very much a system programming language with much more strict typing than TypeScript.
    WebAssembly is a low level assembly language that runs in a high performance 
    virtual machine in your browser, with greatly improved performance over JavaScript. 
  </p>
  <p>
    The backend is a plain ExpressJS server that preprocesses and serves our ROM's 
    (base64 encodes them and locates metadata), as well as an interface for a 
    SQLite database that handles our highscore boards. 
  </p>
</div>





<div>
  <h1>
    Frontend
  </h1>
  <p>
    One of the inital technical hurdles we had to overcome when working on Svelte 
    and WebAssembly at the same is that there's no way to assign variables or access data
    directly that's inside the virtual machine that's running our emulator. We can only 
    access that data by calling functions that define an API for our WASM sandbox. 
    Svelte handles its reactivity via variable assigning, meaning we need a way to 
    automatically execute a function and redefine a varible to the return value of the function, 
    without manually writing that code over and over again, everywhere we might need to 
    send an event to or read data from the emulator. 
  </p>
  <p>
    The solution to this was by utilizing one of the key features of Svelte, in 
    "reactive statements". We can define a store that we'll use as an intermediary 
    from a component that wants to trigger an update, and the component that wants to 
    handle the update. The component that handles the update has a reactive statement in 
    the general form of:
  </p>
  
  <code>
    $: trigger, variable = chip8.read_data()
  </code>

  <p>
    which is to be read as "when this trigger value changes, redefine variable to 
    be the result of read_data()". Within the component that's handling the update, 
    all references to "variable" will reactively update and re-render themselves 
    according to the new data. 
  </p>

  <p>
    Once we had some of the basic functionality of the CPU working, we hit the next 
    issue. We implemented running the CPU via a <code>setInterval</code> that would tick
    the CPU every n milliseconds. We'd calculate the value for n as the reciprocal of 
    our desired instructions per second, which was equivalent to our clock rate as each 
    instruction needs one virtual CPU "tick" to run. If we wanted to run at 1,000 hz, 
    we'd execute a tick once every 0.001 seconds, or every 1 milliseconds. 
  </p>
  <p>
    The CPU did not run at 1,000 hz, and the fastest we could get it to was 150 hertz 
    with the live register view, 200hz if the only output was the display, a far cry 
    from our target. We solved this via two major optimizations. First, we did not 
    need to update our display after every single instruction, and added code to 
    update the display after n CPU ticks. Second, we could queue up multiple CPU ticks 
    per setInterval execution and <i>then</i> rerender the display. WebAssembly was so fast 
    that we could reliably queue up thousands of CPU ticks without worrying if the last batch 
    finished before the next batch, allowing us to hit up to 300,000 hz! Of course, 
    such speeds were overkill for any of the games we're emulating, but it proved that we 
    had the spare bandwidth to implement things such as the live register view and 
    RAM dump. 
  </p>

  <p>
    These bugs aside, it was a genuine joy to work in Svelte. It feels so much more 
    intuitive than other frontend frameworks I've used, with almost no shotguns aimed 
    at my foot. It felt great to refactor massive swaths of code via a copy paste 
    and everything just working first try. 
  </p>

  <p>
    The last week of development was spent mostly conducting usability testing. I 
    ran around campus asking everyone I knew to use the website. I offered no explanation 
    on how to use it, solely telling them that the website is an emulator. I gained 
    a lot of insight into UX design, and how visual elements can draw attention or 
    can be overshadowed. For example, initally sv8 had a 4 by 4 gamepad always displayed, 
    that served to showcase how the keyboard maps to the native Chip-8 gamepad. 
    This proved to be incredibly distracting, and people would spend more time fiddling with 
    that than noticing that there's a "play game" button. This was solved by displaying the 
    4 by 4 gamepad only for games without metadata, and highlighting the currently pressed 
    controls to signal to users that this is the action being performed on that keypress. 
  </p>

  <p>
    There was also a step back then where you had to click on a "load rom" button, that you had 
    to click on after selecting the ROM you wanted to play. The issue is that people would 
    often select their ROM, and then immediately hit "play game". I implemented a little message, 
    reminding the user to click on "load rom" first, but that proved ineffective. 
    The solution was to make it so that ROM's were automatically loaded in on selection, 
    and cutting out that middle step entirely. 
  </p>

  <p>
    UX usability testing was all in all, an incredibly humbling experience. 
  </p>

</div>





<div>
  <h1>
    Emulator
  </h1>

  <p>
    The CPU portion was coded first (for the most part) where began with setting 
    up the registers, the Stack, and references to the Display, Memory, and SoundHandler 
    Objects. Then it was clear to implement a fetch, then decode, then execute methods 
    for the CPU to perform its most important functions. The fetch function was easiest 
    to implement by having it copy the instruction that was stored in memory at address 
    pointed to by PC. Once the instruction is fetched, it needed to be decoded. To 
    simplify this process I would decode every instruction the exact same way, and 
    save the decoded parts into specific object variables: “nnn” (for three nibbles 
    of data), “i” (for the first nibble), “x” (for the second nibble), “y” (for the 
    third nibble), “n” (for the fourth nibble), and “kk” (for the last byte). 
    This ensures that no matter the instruction, we would have all the necessary 
    pieces from the get go. 
    </p>
    <p>
      Now Chip-8 interpreters can execute 35 different instructions, 
      however those 35 are categorized into 16 different types, with the initial label 
      being between 0 through F. The original plan for our decode function was to 
      have a decode table that return an object relevant to which instruction type 
      needed to be executed, and if a instruction type had multiple instructions per 
      type, then some small extra decoding would be necessary. This unfortunately caused 
      many issues and would not work with the AssemblyScript and Svelte combination as 
      we hoped it would. Therefore to simplify the code we moved from a decode table 
      to a standard list of if else statements, and then eventually moved to a switch 
      case. With the instruction fetched and properly decoded, we could then move on 
      to properly execute the instructions. 
    </p>
    <p>
    This was done by the creation of methods for complex instructions. Some Chip-8 
    instructions would be incredibly simple 
    to implement, and could be done in the decode function. There was one bug 
    within our CPU instructions that caused our Chip-8 emulator to fail through 
    processing on many occasions. One of the instructions required setting the 
    program counter to a value from the top of the stack, then moving the stack 
    pointer down. Unfortunately from a small oversight, the PC would be loaded 
    with the immediate address of the stack, and not the actual value stored at 
    that stack address. This would cause the PC to reach an address between 0 and 512, 
    which it should never have access to. Using our own debugger that is 
    implemented on the site, we were able to find and fix the issue.
  </p>

  <p>
    The Display was the final challenge to implement for the Chip-8 emulator solely 
    due to the complexity of drawing sprites. Setting up the display was simple 
    once the concept was explained. Drawing the sprites required a large understanding 
    of edge cases, bit masking/bit manipulation, 2D addressing, and some math to be 
    implemented correctly. You need to keep in mind whether you are drawing near 
    the edge of the screen, would you need to access a new byte in memory halfway 
    through the drawing, did a collision between two ON pixels occur, etc. This 
    complexity led to two bugs within our drawSprite() function. The first was 
    that when the address for the pixel to be drawn was divisible by 8 (therefore 
    not requiring the sprite to access two bytes in memory but only one) the sprite 
    would be drawn twice, once in the original memory byte, and then in the next 
    memory byte. This occurred because there was no condition that kept the sprite 
    from moving on to the next memory byte even if it did not need to, once that 
    condition was implemented the bug was fixed. The process of finding and fixing 
    the bug also heavily required the use of our debugger, as without being able 
    to see the values of all our registers, the pattern of the values being divisible 
    by 8 would not have been so easily spotted. The second bug was much simpler 
    to find and fix. When the Emulator seemed to work perfectly fine, we found 
    then when testing the SpaceInvaders ROM, a problem would occur when the player 
    would shoot an enemy and cause it to disappear, if the player shot in the newly 
    freed space, the enemy would reappear. This is not an intended feature of the 
    game, and was caused by improper pixel collision handling. See when the 
    collision Boolean value would be set to true during a collision, the value 
    would never be reset back to false, causing this weird bug. 
    This was fixed by setting the collision Boolean value back to false 
    at the start of the drawSprite() function.
  </p>
</div>

<div>
  <h1>Assembler</h1>
  <p>
    The first stage of the assembler is preprocessing. The purpose of this step 
    is to remove everything that is not important for the actual parsing stage 
    from the text, as well as split the file up into a table of each line. Comment 
    lines and blank lines are removed from the text, as well as comments and white 
    space that trail code or data lines. As this changes the structure of the original 
    file, we also build a table to map the new line numbers of the processed file with 
    the original file, so that any errors generated can reference the correct line number.
  </p>
  
  <p>
    After preprocessing, comes the main meat and potatoes of any Assembler, the
    parsing and assembling. Parsing first happens by categorizing lines into four
    main categories, directives, labels, data and code. We will now discuss how each is
    handled.
  </p>

  <p>
    Directives: <br>
    Any line starting with a period is assumed to be an assembler directive. As there 
    are only 3 directives, an else if branch is used to check for which is specified. 
    For the .org directive, first a check is done to make sure the address specified 
    is valid and if so it is then assigned to the ROM address counter used to keep 
    track of where in the ROM we are currently assembling to. The other two directives 
    are .text and .data which are used to specify if text is code or data and they 
    set a decodeData flag to specify this for later stages. If any of these parts 
    are given incorrect arguments, errors are thrown. 
  </p>

  <p>
    Labels: <br>
    Any line ending with a colon is assumed to be a label. First, the label name 
    is checked to see if it is alphanumeric and not an integer (to avoid ambiguity 
    as integer name labels are impossible to tell apart from numerical addresses in 
    instruction arguments). If it passes these checks, the ROM address the label 
    was specified at is recorded along with the label in an address lookup table, 
    otherwise an error is thrown.
  </p>

  <p>
    Data: <br>
    Data is only parsed if the decodeData is set from an assembler directive. If 
    it is set, the line is parsed by first splitting the line along any commas, 
    and then removing white space from this table of split data. The data is then 
    checked to see if it is in a valid format, and then it's written to the ROM. 
    The ROM address counter is updated based on how much data was specified in the 
    line. If any of this fails, an error is thrown.
  </p>

  <p>
    Instructions: <br>
    Any line that doesn't fit into any of the above categories are assumed to be 
    instructions. First the line is split along white space, to separate arguments. 
    The first argument is assumed to the specified instruction, and this is then 
    passed to a special hash table. This table will either return a reference to 
    the function to run to decode further arguments if the instruction is valid, 
    or it will return undefined if the instruction is not valid. If it's undefined 
    we throw an error, otherwise we run the returned function reference. This 
    function parses the rest of the non instruction arguments, removing things 
    like the “V” in register definition as well as things like commas. If the 
    arguments are invalid, an error code is returned which then can be used to 
    lookup and throw an error. After this is all done the parsed arguments are 
    placed in a special table for the final step, the assembling of the instructions.
  </p>

  <p>
    Using a large switch case block with the instruction used as the switch, we 
    select what code to run based on the instruction given. This code varies 
    from instruction to instruction, but it consists of using bitwise operations 
    to combine an instruction opcode with the decoded arguments fields in certain 
    configurations. This is then written to the ROM file based on the ROM address 
    counter which is also incremented by 2 (the size of an instruction) after each 
    successful iteration. 
  </p>
  <p>
    There is an exception to this, which is instructions that have labels as arguments. 
    As a label can be defined after an instruction uses it, one final pass must be 
    done to account for this. While assembling, if an instruction requests a label, 
    we add it to  a label request table which specifies which instruction at what 
    address wants what label. After assembly, we then go through the ROM and at 
    each specified request we check to see if the label exists in our label lookup 
    table (it rhymes!). If it does, we modify the assembled instruction to have 
    the correct address, otherwise if it doest exists we throw an error.
  </p>

  <p>
    After all of this we should have a fully assembled ROM file, ready for use! 
    The thing is that CHIP-8 programs start being loaded from address 512. While 
    we account for this while building our rom for the label addresses to be correct, 
    by starting our ROM address counter at 512, we must now un-account for this 
    for the ROM to be loaded correctly! So we simply recopy the top 3.5k of the 
    ROM into a new buffer, after which we have a finalized ROM! 
  </p>
</div>



</div>


<style>
  div > div {
    width: 60%;
    padding: 1%;
    margin-top: 2%;
    outline: 2px solid black;
    border-radius: 4px;
    box-shadow: 10px 10px 0px -1px black;
  }

</style>