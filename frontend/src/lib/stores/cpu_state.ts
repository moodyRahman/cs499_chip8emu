import { writable } from 'svelte/store';

export const registers_trigger = writable(0);
export const display_trigger = writable(0);
export const rom_name = writable('');
export const rom = writable(new Uint8Array());
export const base_store = writable(16);
