import { writable } from 'svelte/store';

export const registers_trigger = writable(0);
export const display_trigger = writable(0);
export const rom_name = writable('');
export const rom = writable(new Uint8Array());
export const base_store = writable(16);
export const debug_mode_store = writable(false);
export const keypress_store = writable('');
export const audio_store = writable(false);
