<script lang="ts">
    import * as chip8 from "$lib/chip8/debug.js";
    import {Howl, Howler} from 'howler';
	import { audio_store, base_store, debug_mode_store, registers_trigger } from "$lib/stores/cpu_state";

    import config from "../cpu_configs";

    let trigger: number;

    registers_trigger.subscribe((n) => {
        trigger = n;
    })

    let registers: Uint16Array;
    $: trigger, registers = chip8.read_all_registers();

    // controls how many bytes of memory adjacent to the program counter to display
    let pc_highlight_index = config.ram_adjacent_to_pc;

    let base: number;

    base_store.subscribe((n) => base = n);

    var sound = new Howl({
        src:["data:audio/wav;base64,UklGRroiAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAATElTVBoAAABJTkZPSVNGVA4AAABMYXZmNTguNzYuMTAwAGRhdGF0IgAAAAAAAAAA/v8EAPz/AwD///7/BAD8/wMA/////wIA/f8EAPz/BAD8/wQA+/8GAPv/AwD//wAAAQD//wAAAQD//wEAAAD+/wMA/f8CAAAA/v8DAP7/AAABAP7/AwD9/wIA//8AAAEA//8AAAAAAAABAP7/AwD8/wQA/f8CAP//AQD+/wIA//8BAAAA/v8CAP//AQD//wAAAQD//wEA//8BAP7/AwD9/wMA/f8DAP3/AgD//wAAAgD8/wUA+/8EAP7/AAABAAAA//8BAAAA//8CAP7/AQAAAAAAAAAAAAAA//8CAP7/AgD+/wEAAAD//wIA/v8CAP//AAD//wIA//8AAAEA/v8CAP7/AQABAP7/AwD8/wMA//8AAAEA//8AAAAAAAABAP7/AgD+/wIA//8AAAAAAAAAAAEA/v8CAP//AAAAAAAAAAABAP////8CAP//AAACAPz/BAD9/wMA/f8DAP3/AgD//wEA//8AAAEA/v8CAP//AAABAP7/AwD9/wIAAAD+/wMA/f8CAAAA/v8CAP7/AgD//wAA//8CAP3/BAD9/wAAAgD9/wOa/pkBmgCa/5kBmgCaAJoBmv2ZA5r+mQKa/pkCmv6ZAZoAmv+ZAZoAmgCaAJr/mQKa/ZkEmvyZA5r+mQGaAJr/mQGaAJoAmv+ZApr9mQSa/ZkBmgCa/5kCmv6ZApr+mQGaAJoAmgCaAJoAmgCaAZr9mQSa/JkEmvyZA5r+mQKa/pkBmgCa/5kCmv6ZAZoBmv2ZA5r/mf+ZApr9mQOa/pkCmv2ZA5r9mQOa/pkBmv+ZAZoAmv+ZAZoAmv+ZAZr/mQGaAJr/mQGa/pkDmv6ZAZoAmv+ZAZoAmv+ZApr9mQOa/pkBmgCa/5kAmgGaAJoAmv+ZAZr/mQGaAJr/mQGa/5kBmv6ZA5r8mQSa/ZkCmv6ZApr+mQKa/pkCmv6ZA5r8mQOa/pkCmv6ZApr+mQKa/5n/mQKa/pkDmv2ZApr/mQGa/5kBmv+ZAZoAmv+ZAZr/mQGa/5kAmgGa/5kBmv+ZAZr/mQCaApr8mQWa+5kEmv2ZA5r9mQKa/5kBmv6ZA5r9mQKa/5kAmgCaAJr/mQKa/pkCmv6ZAJoCmv7/AgD+/wEAAAAAAAAAAAAAAAAAAAAAAAAAAAABAP7/AgD//wAAAQD+/wIA//8AAAAAAAD//wEAAAD//wEA//8AAAEA//8AAAEA//8AAAEA/v8DAP7/AAACAP3/AwD/////AwD8/wMAAAD9/wUA+v8FAP3/AQAAAP//AQAAAP//AQD//wEA//8BAP7/AgAAAP7/AgD+/wIA//8AAAAAAAAAAAAAAAAAAAEA/v8CAP7/AQAAAAEA/v8DAPz/AwD+/wIA/v8CAP////8CAP7/AQAAAP//AQAAAP//AQD//wEA//8AAAAAAAAAAAAAAAD//wIA/f8EAPz/AwD+/wIA/v8CAP7/AgD//wAAAQD+/wMA/f8CAAAA//8BAP//AQD//wEA//8BAAAA//8AAAEAAAD//wIA/f8DAP7/AQAAAAAA//8BAAAA//8CAP3/AgAAAP//AQAAAP//AQAAAP//AQAAAP7/BAD8/wIAAAD//wEAAAD//wEAAAD//wEAAAD+/wQA+/8EAP7/AAACAP3/AgD//wEAAAD//wEA//8CAP3/BAD7/wUA/P8DAP7/AQD//wEAAAAAAP//AQD//wIA/v8BAP//AQAAAP//AQD//wEA//8BAAAA/v8EAPv/BQD9/wAAAgD9/wMA/v8BAAAAAAD+/wMA/f8EAPz/AgD//wAAAgD+/wEAAAD+/wQA/P8DAP7/AQAAAP//AQD//wEAAAD+/wMA/f8DAP7/AAACAP7/AQABAP3/BAD9/wEAAQD+/wIA//8AAAAAAAAAAAAAAAAAAAAAAAD//wEAAAAAAAAA//8CAP3/AwD+/wEAAAD//wEAAAAAAAAA//8BAAEA/v8DAPz/AwD//wAAAAAAAAAAAAAAAAAA//8DAPz/AwD+/wEAAAAAAP//AgD9/wMA/v8BAAAA//8BAAAAAAAAAP//AgD9/wQA/P8DAP7/AQAAAP//AgD9/wMA/v8BAAAA//8BAP//AgD+/wIA/v8BAAAAAAAAAAAAAAAAAAAA//8BAAAA//8CAP7/AQAAAAAA//8CAP7/AgD+/wIA/v8CAP7/AQAAAAAAAAAAAAAAAAD//wIA/f8EAPz/AgAAAP//AQD//wEA/v8DZv1lA2b9ZQJm/mUDZv5lAGYAZgBmAmb+ZQBmAGYAZgJm/WUCZv5lA2b9ZQNm/WUCZv9lAGYCZv1lA2b9ZQJmAGb/ZQFmAGb/ZQFm/2UBZgBmAGb+ZQJm/mUCZgBm/2UAZgBmAGYAZgJm/WUCZv9lAGYBZgBm/mUDZvxlBGb+ZQBmAWb/ZQBmAGYBZv5lA2b9ZQJm/2UAZgFm/2UBZv9lAGYCZv1lAmb/ZQBmAWb/ZQBmAGYBZv5lA2b9ZQJm/2UBZv5lA2b+ZQBmAmb8ZQRm/mUBZgBm/mUDZv5lAWYAZv9lAWYAZgBmAGb/ZQJm/WUEZvxlA2b+ZQJm/mUCZv5lAmb/ZQFm/2UAZgBmAmb9ZQRm+2UEZv5lAmb+ZQFmAGb/ZQJm/mUBZgBm/2UBZv9lAmb9ZQNm/WUDZv5lAWb/ZQFmAGYAZv9lAWYAZgBmAGYAZv9lAmb+ZQJm/mUCZv5lAWYBZv9l/2UCZv1lBGb9ZQJm/mUBZgBmAGYAZgBmAGYAZgBm/2UCZv5lAWYBZv1lBGb8ZQNm/2UAAAAAAAAAAAEA//8AAAEA/v8DAP3/AgD//wAAAAAAAAAAAAABAP7/AgD//wAAAAABAP7/AwD8/wUA+/8EAP3/AgAAAP//AQD//wEAAAAAAP//AQD//wIA/v8BAP//AQAAAP//AgD8/wUA/P8DAP7/AQD//wIA/v8CAP7/AgD9/wQA/f8CAP7/AgD+/wIA//8AAAEA//8BAP//AQD//wAAAQAAAP//AQD+/wMA/f8DAP7/AAACAP3/AwD+/wAAAQD//wAAAQD+/wMA/P8EAPz/BAD9/wMA/f8CAP//AAABAAAA/v8EAPv/BQD7/wQA/v8BAP//AQD//wEA//8AAAEA//8AAAIA/P8FAPv/AwAAAP//AQD/////AwD9/wIA//8AAAEA/v8CAP//AAACAP3/AwD9/wMA/v8CAP7/AQAAAP//AgD9/wQA/P8DAP3/AwD+/wIA/v8CAP3/BAD8/wQA/f8CAP7/AgD+/wEAAQD+/wIA/////wIA/////wMA/f8BAAIA/P8DAP////8DAP3/AgD+/wIA/v8CAP//AAABAP7/AgD+/wIA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQD+/wIA/v8BAAIA/P8EAPz/AwD+/wIA/v8BAAAA//8CAP7/AgD+/wIA//8AAAEA/v8DAP3/AgD//wAAAQD+/wMA/f8CAP//AAABAP//AAABAP7/AwD8/wQA/f8CAP//AAABAP//AQD//wEAAAD//wIA/f8DAP////8CAP3/AwD+/wEAAAD//wIA/f8DAP7/AQAAAAAAAAD//wIA/f8FAPv/AwD+/wIA/v8DAPz/BAD9/wEAAQD+/wIA/////wIA//8AAAAAAAD//wMA/P8EAP3/AQAAAAEA/v8EAPr/BQD9/wEAAQD+/wIA/v8CAP7/AQAAAAAAAAABAP3/BAD8/wQA/P8EAPz/AwD+/wEA//8CAP3/AgD//wAAAQD//wAAAQD+/wMA/f8CAP//AQD//wEA/v8DAPz/BQD6/wYA+v8GAPr/BQD8/wIAAAAAAP//AgD9/wMA/v8BAAAAAAAAAAAA//8BAP//AgD+/wEAAAD//wEAAJr/mQGaAJr/mQKa/pkAmgKa/ZkEmvyZA5r+mQGaAJr/mQKa/ZkEmvuZBZr7mQSa/pkBmv6ZApr+mQOa/ZkCmv6ZApr/mQCaAJoBmv6ZA5r8mQOa/5kAmgGa/pkBmgCaAJoAmgGa/pkBmgGa/pkCmv6ZAZoBmv6ZApr9mQSa/JkEmv2ZApr/mQGa/pkDmv2ZA5r9mQKa/5kAmgGa/pkDmv2ZApr/mf+ZA5r9mQKa/5kAmgCaAJoBmv6ZA5r9mQKa/5kBmv6ZApr/mQGa/5kAmgGa/pkEmvqZBpr8mQKa/5kAmgGa/5kAmgCaAJoCmv2ZApr/mQCaAZr/mQGa/5kBmv+ZAJoBmgCa/5kCmv2ZA5r+mQGaAJr/mQKa/ZkEmvyZA5r/mf+ZApr+mQKa/pkCmv6ZApr/mQCaAJr/mQKa/5kAmgCa/5kCmv6ZAZoAmv+ZA5r8mQOa/pkCmv6ZApr+mQKa/pkBmgCaAJr/mQKa/ZkEmvyZA5r+mQKa/pkBmgCa/5kCmv2ZA5r9mQSa+5kFmvuZBZr8mQKaAJr//wIA/f8DAP7/AQAAAP//AgD+/wEA//8CAP7/AgD+/wEAAAD//wIA/v8CAP7/AgD+/wIA/v8CAP//AAABAP7/AwD9/wEAAQD+/wIA//8AAAAAAAD//wIA//8AAAAAAAAAAAAAAQD+/wMA/f8CAP//AAAAAAIA/P8FAPv/BAD+/wAAAQAAAAAA//8AAAEAAAAAAP//AAABAP//AAACAP3/AwD+/wEA//8CAP3/AwD+/wEAAAD//wEA//8BAP//AQD+/wQA/P8CAAAA/v8DAP7/AQAAAP//AQD//wEAAAD//wEA//8BAAAA//8CAP3/AwD9/wMA/v8BAP//AAABAP//AQD+/wMA/P8EAP3/AwD9/wIA/v8CAP//AQD//wEA/v8CAP//AAABAP//AAAAAAAAAAAAAAAA//8CAP7/AgD+/wIA/f8FAPv/BAD9/wIA//8BAP7/AwD8/wUA+/8EAP3/AgD//wEA//8BAP//AQD//wEAAAAAAAAA//8CAP7/AgD/////AgD+/wIA/v8CAP3/AwD+/wEA//8BAP//AgD9/wIA//8CAP7/AQD+/wMA/v8CAP3/AgD//wEAAAAAAP7/AwD+/wIA/////wIA/v8CAP////8DAPz/BAD8/wQA/f8CAP7/AgD+/wMA/f8CAP//AQD+/wIA//8AAAEA/v8BAAAAAAAAAAAA//8CAP7/AgD+/wIA/v8CAP7/AQAAAAAAAAAAAAAA//8CAP//AAABAP3/BQD7/wUA+/8EAP3/AwD9/wMA/f8CAAAA//8BAP//AQAAAP//AgD9/wQA/P8DAP7/AQABAP3/BAD8/wMA//8AAAAAAAAAAAAAAQD+/wMA/P8EAP3/AgD//wAAAQD//wAAAQD+/wIA//8AAAEA//8AAAEA/v8DAP3/AgD//wAAAAABAP7/AwD9/wIA//8AAAEAAAD//wEA//8BAAAA//8BAP//AQD//wAAAQD//wEA//8AAAAAAQD//wEA//8AAAEA//8BAAAA//8BAAAA//8DAPz/AwD+/wIA/////wIA/v8BAAEA/f8EAPz/AwD+/wEAAAD//wIA/f8DAP3/AwD+/wEA//8BAP//AQD//wIA/f8DAP3/AmYAZv9lAWb/ZQFm/2UBZv5lA2b9ZQJmAGb+ZQJm/2UAZgFm/2UAZgBmAWb+ZQNm/WUCZv9lAGYAZgFm/mUCZv9lAGYBZv9lAGYBZv9lAGYCZv1lA2b9ZQFmAWb+ZQNm/GUDZv5lAmb/Zf9lAmb+ZQJm/mUCZv5lAmb+ZQJm/mUCZv5lAmb/ZQBmAGYAZgBmAWb/ZQBmAGYAZgBmAGYAZgBmAGYAZv9lAWYAZv9lAmb+ZQFm/2UCZv5lAmb9ZQNm/mUBZgFm/WUDZv5lAWb/ZQJm/mUBZgFm/WUEZvxlBGb8ZQRm/GUDZv5lAWYAZgBm/2UBZgBm/2UBZgBm/2UCZv5lAGYCZv5lAWYBZv1lBGb8ZQRm/GUDZv9l/2UDZvtlBWb8ZQNm/2X/ZQFm/2UBZv9lAmb+ZQFm/2UAZgFmAGb/ZQFm/2UAZgFm/mUDZv1lAmb/Zf9lA2b8ZQVm+2UEZv1lAWYBZv5lA2b9ZQJm/mUCZv5lA2b8ZQRm/GUEZv1lAWYBZv5lAmb+ZQJm/mUCZv5lAWYAZv9lAgD+/wIA/v8BAAAAAAAAAP//AgD9/wMA/v8BAP//AQD//wIA/v8BAP//AgD+/wIA/v8BAAAAAAAAAAAAAAD//wIA/v8BAAEA/f8DAP7/AQAAAAAA//8CAP7/AgD+/wEAAAAAAAAAAAD//wIA/v8CAP7/AgD/////AgD+/wIA/v8BAP//AgD9/wIAAAD+/wMA/f8CAP//AQD+/wMA/f8CAP//AQD//wEA//8AAAEA//8BAP//AQD//wAAAQD//wEA//8BAP//AQD//wEA//8CAP3/AwD+/wEAAAAAAP//AgD+/wIA/v8CAP7/AQAAAP//AQABAP3/BAD8/wMA/v8CAP7/AgD+/wIA/v8BAAAA//8CAP7/AQD//wEA//8BAAAA//8CAP3/AwD9/wMA///+/wQA+/8FAP3/AAACAP7/AQABAP3/BAD8/wMA/v8BAAAA//8CAP3/AwD+/wEAAAD//wEA//8BAP//AQD//wAAAAABAP//AQD//wAAAQD//wEA//8BAAAA/v8DAP3/AwD+/wEA/v8DAP3/AgD//wEA/v8CAP7/AgD//wAA//8BAAEA//8AAAAA//8BAAIA/P8FAPr/BAD//wAAAAAAAAAAAAAAAAAAAAABAP7/AwD8/wQA/f8BAAEA/v8CAP7/AQD//wEAAAAAAAAA//8BAAAAAAAAAAAAAAD//wIA/f8EAPz/AwD+/wEAAAAAAAAAAQD+/wIA//8AAAEA//8AAAEA//8BAP7/AgD//wAAAQD+/wIA//8AAAEA/v8CAP//AAABAP//AAABAP//AAACAPz/BQD8/wIAAAD+/wMA/v8BAAAA/v8DAP3/AgD//wAAAQD//wAAAAAAAAAAAQD//wAAAAAAAAEA//8AAAAAAAAAAAAAAQD+/wMA/P8DAP7/AwD8/wUA+v8GAPv/AwD/////AwD8/wMA/////wIA/v8CAP7/AgD+/wIA//8AAAAAAAD//wMA/P8EAPz/AwD/////AgD+/wIA/////wIA//8AAAEA/v8CAP//AAAAAAAAAAABAP7/AgD+/wIA//8AAAEA/v8DAPz/BQD7/wQA/v8AAAEAAAD//wIA/f8DAP7/AQD//wIA/v8BAACa/5kBmgCa/5kCmv2ZA5r+mQGaAJr/mQGa/5kBmgCa/5kBmv+ZAJoBmv+ZAZr/mQCaAZr/mQGa/5kAmgKa/ZkDmv2ZA5r9mQKaAJr+mQOa/ZkCmv+ZAJoBmv+ZAJoBmv6ZA5r+mf+ZA5r8mQSa/pkAmgCaAZr+mQOa/ZkCmv+ZAZr+mQOa/ZkCmgCa/pkDmv6ZAZoAmv+ZAZoAmgCaAJr/mQGa/5kCmv6ZAZr/mQGa/5kBmgCa/5kBmv+ZAZoAmv+ZAZr/mQGa/5kBmv+ZAZr/mQGa/5kAmgGa/5kBmv+ZAJoAmgGa/pkCmv+ZAZr/mQGa/pkDmv6ZAZr/mQGa/5kBmgCa/pkCmgCa/pkDmvyZA5r/mQCa/5kBmgCa/5kCmv2ZA5r+mQGaAJr/mQKa/pkBmgCa/5kBmgCaAJoAmgCaAJr/mQKa/pkCmv+ZAJoAmgCaAJoBmv6ZA5r8mQSa/ZkCmv+Z/5kCmv6ZApr/mf+ZApr+mQKa/5n/mQKa/pkCmv+ZAJoAmv+ZApr/mQCaAZr+mQKa/5kAmgEA/v8DAPz/BAD8/wMA/v8CAP7/AQD//wEA//8BAAAA//8BAP//AAACAP3/AgAAAP7/AwD8/wQA/f8DAPz/BAD9/wIA//8AAAEA//8AAAAAAQD//wAAAAAAAAEA//8AAAAAAQD+/wQA+v8GAPz/AgD//wAAAQD//wAAAQD+/wMA/f8CAP//AAAAAAAAAQD+/wIA/v8BAAEA/v8CAP7/AQABAP7/AgD+/wEAAAAAAP//AgD+/wIA/v8BAAAAAAAAAAEA/v8CAP7/AgD+/wEAAQD9/wQA/P8DAP7/AgD+/wIA/v8BAAAAAAAAAAAA//8CAP7/AQAAAAAAAAD//wIA/v8CAP7/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8CAP3/AwD+/wEAAAD//wEAAAD//wEAAAAAAAAA//8AAAEAAQD+/wEA//8AAAIA/f8DAP3/AwD+/wEAAAD//wEA//8DAPz/BAD8/wMA//8AAAEA/v8CAP7/AwD9/wIA/v8CAP//AQD+/wMA/P8EAP3/AwD9/wMA/f8CAAAA//8BAAAA//8BAAAA//8BAP//AQAAAP//AQD//wIA/f8DAP7/AQAAAAAA//8BAAAA//8CAP3/AgAAAAAA//8BAP//AQAAAP//AQD//wEA//8CAP3/AgD//wAAAQD//wAAAQD9/wQA/P8EAP3/AgD+/wIA//8AAAEA//8AAAEA/v8CAP7/AgD+/wIA/v8CAP7/AgD+/wIA//8AAAAAAAAAAAAAAQD9/wQA/P8DAP////8BAAAA//8CAP3/AwD9/wMA/v8BAP//AAABAP//AQD//wAAAQD+/wMA/f8DAP3/AwD8/wUA+/8EAP7/AAABAP//AQD//wEA//8CAP3/AwD+/wAAAQD//wEAAAD+/wIA//8BAP//AQD+/wIA//8BAP7/AwD9/wMA/f8CAAAAAAAAAP//AAACAP7/AQAAAP//AgD+/wEAAAAAAAAA//8CAP7/AgD+/wEAAAAAAP//AgD+/wIA/v8BAAAAAAAAAAAAAAAAAAAAAAAAAAEA/v8CAP7/AgD//wAAAAABAP//AAAAAAAAAQAAAP7/AwD9/wMA/v8AAAEA//8BAAAA//8BZv9lAWb/ZQFm/2UCZv1lA2b9ZQNm/mUBZv9lAWYAZgBm/2UCZv1lBGb8ZQNm/2X/ZQJm/WUEZvxlBGb8ZQNm/mUCZv5lA2b8ZQRm/GUDZv9lAGYBZv5lAmb+ZQJm/2UAZgBmAGYAZgBmAWb9ZQRm/GUDZgBm/mUCZv5lAWYAZgFm/mUCZv5lAWYAZgBm/2UCZv1lA2b/Zf5lBGb7ZQRm/2X+ZQNm/WUCZgBm/2UAZgFm/2UBZv9lAWYAZv9lAWb/ZQJm/mUCZv1lA2b+ZQFmAGb/ZQFm/2UAZgJm/WUCZv9lAWYAZv9lAGYBZgBmAGb/ZQFm/2UCZv5lAWYAZv9lAmb+ZQFmAGYAZv9lAWYAZgBm/2UBZv9lAWYAZv9lAWb/ZQFm/2UBZgBm/2UBZv9lAWYAZgBm/2UBZgBm/2UCZv1lAmYAZgBm/2UBZv9lAWYAZv9lAmb+ZQFmAGYAZgBmAGb/ZQJm/mUCZv5lAmb/ZQBmAGYAZgBmAmb9ZQJm/2UAZgFmAGb/ZQFmAGb/ZQJm/mUBZgFm/WUEAPz/AwD/////AgD9/wMA/v8CAP7/AQAAAAAAAAAAAAAA//8CAP7/AQABAP7/AQABAP3/AwD/////AwD7/wQA/v8AAAIA/f8CAAAA/v8DAP7/AQAAAAAA//8BAAAA//8CAP7/AQAAAP//AQAAAAAA//8CAP7/AQABAP3/BAD8/wMA/v8CAP7/AQD//wIA/v8BAAAA//8DAPz/AwD+/wEAAQD//wAA//8CAP7/AwD9/wEAAQD9/wUA+/8EAP3/AgD//wAAAQD//wEA//8AAAAAAQD//wEA//8AAAEA//8BAP//AQAAAP//AQD//wIA/f8EAPv/BgD7/wIAAAAAAAAAAQD+/wEAAAAAAAAAAAAAAAAAAAAAAP//AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP7/AQABAP3/AwD/////AgD+/wEAAQD+/wIA//8AAAAAAAAAAAEA/v8CAP7/AgD/////AgD+/wIA/v8BAP//AgD+/wIA/v8BAAAAAAAAAAEA/v8BAAAA//8CAP7/AQD//wEAAAD//wIA/f8DAP////8CAP7/AgD//wAAAQD+/wIA//8AAAEA/v8CAP7/AgD+/wIA/v8DAPv/BgD6/wYA/P8BAAAA//8DAPz/AwD/////AwD8/wMA/////wMA/P8EAPz/BAD9/wEAAAAAAP//AwD7/wUA/f8BAAAAAAD//wIA/v8BAAAAAAAAAP//AQD//wIA/v8BAP//AQD//wEAAAD//wIA/f8DAP7/AQAAAP//AQD//wEAAAD+/wMA/f8DAP7/AQD//wEAAAD//wEA//8BAP//AQD+/wMA/f8DAP3/AgD+/wMA/f8CAP//AAAAAAEA/v8DAP3/AgD//wAAAQD+/wMA/f8CAP7/AgD//wEA//8BAP7/AwD9/wMA/v8BAP//AQD//wIA/f8EAPz/AgAAAP//AgD///7/BAD8/wMA/v8BAAAAAAD//wEAAAAAAP//AgD9/wQA/P8DAP3/AwD+/wEAAQD9/wMA/v8BAAAAAAAAAAAAAAD//wIA/v8CAP7/AgD+/wIA/f8EAP3/AQABAP3/BAD8/wMA/v8BAP//AgD9/wMA/f8CAP//AQD//wEA//8AAAEA/5kCmv2ZA5r9mQOa/pkAmgKa/ZkDmv2ZApoAmv+ZAJoCmvyZBZr7mQSa/pkAmgCaAJoAmgGa/pkCmv6ZApr/mf+ZA5r9mQOa/ZkDmv2ZA5r9mQOa/ZkCmv+ZAZr/mQGa/pkCmgCa/5kBmv+ZAJoBmv+ZAZoAmv6ZApr/mQCaApr9mQOa/ZkDmv2ZA5r+mQCaAZr/mQGa/5kAmgGa/pkCmv+ZAJoCmv2ZApr/mQGaAJr/mQKa/pkAmgKa/ZkDmv+Z/pkDmv6ZAZr/mQGa/5kBmgCa/pkDmv2ZApoAmv6ZApr/mQGa/5kBmv6ZApr/mQGa/5kBmv+ZAJoCmv2ZA5r9mQOa/pkBmgCa/5kBmgCa/5kCmv2ZA5r+mQKa/pkBmv+ZApr+mQGaAJr/mQGaAJr+mQSa+5kFmvyZApoAmv+ZApr+mQKa/pkCmv6ZApr/mQCaAZr/mQCaAZr+mQOa/ZkDmv2ZA5r9mQKa/5kBmv+ZAJoAmgGa/pkDmvuZBpr7mQSa/ZkCmv+ZAZr+mQOa/ZkCmv+ZAJoAmgGa/pkCAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8CAP3/BAD8/wQA/f8BAAAAAAAAAAEA/v8CAP7/AgD+/wIA/v8CAP7/AQAAAP//AgD+/wIA/f8DAP7/AQAAAAAA//8DAPz/BAD9/wEAAgD8/wUA+/8EAP3/AgD+/wMA/f8DAP3/AgD//wEA//8BAP//AQD+/wMA/P8FAPv/BAD+/wAAAgD8/wUA+/8FAP3/AAABAP//AQAAAP//AAABAP7/AwD9/wIA//8AAAAAAAABAP//AQD/////AwD9/wIA//8AAAAAAQD+/wIA/v8CAP7/AQAAAP//AgD+/wEA//8BAP//AgD+/wEA//8BAP//AQAAAP7/BAD7/wQA/f8CAAAA//8BAP7/AgD//wAAAQD//wAAAAAAAAAAAQD//wAAAAAAAAAAAAAAAAEA/v8CAP7/AQABAP//AQD+/wMA/f8DAP3/AwD9/wMA/f8CAP//AQD//wAAAQD+/wMA/f8CAP//AAABAP7/AgD/////AwD8/wMA/v8CAP3/BAD7/wUA/P8DAP3/AwD+/wEA//8CAPz/BgD6/wUA/f8AAAIA/f8EAPz/AwD+/wEAAAD//wIA/f8EAPv/BQD8/wMA///+/wQA+/8EAP///v8EAPv/BAD9/wIA//8AAAIA/P8EAP3/AgD//wAA"],
        onplay: () => {
            if (sound.playing()) return;
        },
        loop: true,
        volume: .05,
        html5: false

    })

    $: (() => {

        if (registers[37] === 0) {
            sound.stop()
            return;
        }

        if (sound.playing()) {
            return;
        }

        if (registers[37] > 0){            
            audio_store.set(true)
            sound.play()
        }
        else {
            audio_store.set(false)
            sound.pause()
        }
    })()


    let debug = false;

    debug_mode_store.subscribe((n) => {debug = n})
</script>

<div>
    {#if debug}
    registers <button on:click={() => base_store.set(base === 16?10:16)}>displaying base {base}</button>
    <div class="registers">
        {#each registers.slice(0, 16) as register, i}
            <span class="register">V{i.toString(base)} {register.toString(base)}  </span>
        {/each}
    </div>
    <div>
        {#each registers.slice(16, 32) as register, i}
            <span class="register">S{i.toString(base)} {register.toString(base)}  </span>
        {/each}
    </div>
    <div>
        <span class="register">pc: {(registers[32]).toString(base)}</span>
        <span class="register">sp: {registers[33].toString(base)}</span>
        <span class="register">index: {registers[34].toString(base)}</span>
        <span class="register">dt: {registers[35].toString(base)}</span>
        <span class="register">key: {registers[36].toString(2).padStart(16, "0")}, {registers[36].toString(base)}</span>
        <span class="register">st: {registers[37].toString(base)}</span>
        

    </div>
    data adjacent to PC
    <div>
        {#each chip8.ram_around_address(pc_highlight_index, pc_highlight_index+1, registers[32]) as mem, i}
            {#if i == pc_highlight_index || i == pc_highlight_index + 1}
                <span class="highlight adjacent">
                    {mem.toString(base).padStart(2, "0")}
                </span>
            {:else}
            <span class="adjacent">
                {mem.toString(base).padStart(2, "0")}
            </span>
            {/if}

            
            {/each}
        </div>
        <div>
            {chip8.convert_inst_to_string(((chip8.ram_around_address(pc_highlight_index, pc_highlight_index, registers[32])[pc_highlight_index] << 8) | chip8.ram_around_address(pc_highlight_index, pc_highlight_index, registers[32])[pc_highlight_index+1]))}
        </div>
        {/if}
    </div>

<style>
    .registers {
        width: 50%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
    .register {
        margin-left: 10px;
    }

    .highlight {
        background-color: black;
        color: white;
    }

    .adjacent {
        margin-left: 5px;
        padding: 2px;
    }
</style>