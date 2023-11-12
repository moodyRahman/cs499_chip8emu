const config = {
    hertz: {
        ticks_per_interval: 5,
        time_between_intervals_ms: 10,
        display_rerender_threshold: 100   // amount of cpu ticks before re-rendering the display
    },
    ram_adjacent_to_pc: 10,
    rom_dump_display_rows: 22,
    backend_url: "http://localhost:3000"
}

export default config

/** some hertz combos
    ticks_per_interval         1      4       5       6       1       2       1
    time_between_intervals_ms  10     10      10      10      5       5       20
    resulting hertz  inst/s    90hz   390hz   480hz   570hz   170hz   360hz   40hz
 */
