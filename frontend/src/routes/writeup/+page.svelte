<div>
    here goes the technical writeup
<pre>
things to write about:
    - initally we could only hit 150 hz, 200 hz without anything but the display
        - the issue is with setInterval having a lowest interval of 4ms
        - solved via queuing in multiple ticks per setInterval
    - issue with sprite editor and clicking on a trackpad
        - sometimes a mosedown event is not a mouseclick event, which caused the 
          component to enter a weird in between state
        - fixed to detect mousedown event
    - initally we'd manually create and delete setInterval loops whenever a CPU parameter changed
        - this proved to be monumentally awful, as handling the interval ID and 
          clearing them in a safe way was hard and we'd often end up with setIntervals 
          that would keep running in the background 
        - fixed by converting to a global event loop timer that constantly tries to 
          tick the emulator, and it prevented by state variables that declare the 
          cpu to be in an off state
        - we reactively kill and immediately start the loop under a single condition, when the timing changes, and that's it.
        - before, we'd kill the loop when the cpu pauses and restart it when the cpu resumes

    
</pre>
</div>