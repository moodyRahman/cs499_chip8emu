import { derived, writable } from 'svelte/store';

interface metadata {
	status: number;
	data: {
		description: string;
		mapping:
			| [
					{
						keyboard: string;
						chip8_input: string;
						description: string;
					}
			  ]
			| [];
	};
}

export const registers_trigger = writable(0);
export const display_trigger = writable(0);
export const rom_name = writable('');
export const rom = writable(new Uint8Array());

export const rom_metadata = writable<metadata>({
	status: 0,
	data: {
		description: 'loading...',
		mapping: []
	}
});

export const rom_status = derived(rom_metadata, ($rom_metadata) => $rom_metadata.status);
export const rom_description = derived(
	rom_metadata,
	($rom_metadata) => $rom_metadata.data.description
);
export const rom_mappings = derived(rom_metadata, ($rom_metadata) => $rom_metadata.data.mapping);

export const base_store = writable(16);
export const debug_mode_store = writable(true);
export const keypress_store = writable('');
export const audio_store = writable(false);
