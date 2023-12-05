import { derived, writable } from 'svelte/store';

interface metadata {
	status: number;
	data: {
		description: string;
		mapping:
			| [
					{
						keyboard: string;
						description: string;
					}
			  ]
			| [];
		timing: {
			ticks_per_interval: number;
			time_between_intervals_ms: number;
			display_rerender_threshold: number;
		};
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
		mapping: [],
		timing: {
			ticks_per_interval: 8,
			time_between_intervals_ms: 8,
			display_rerender_threshold: 8
		}
	}
});

export const rom_status = derived(rom_metadata, ($rom_metadata) => $rom_metadata.status);
export const rom_description = derived(
	rom_metadata,
	($rom_metadata) => $rom_metadata.data.description
);
export const rom_mappings = derived(rom_metadata, ($rom_metadata) => {
	return $rom_metadata.data.mapping;
});

export const rom_timings = writable({
	ticks_per_interval: 8,
	time_between_intervals_ms: 8,
	display_rerender_threshold: 8
});

export const rom_timings_original = writable({
	ticks_per_interval: 8,
	time_between_intervals_ms: 8,
	display_rerender_threshold: 8
});

export const base_store = writable(16);
export const debug_mode_store = writable(false);
export const keypress_store = writable('');
export const audio_store = writable(false);

export const loading = writable(false);

export const run_game_animation = writable(false);

export const is_running = writable(false);

export const sprites_array = writable<
	{
		name: string;
		pixels: boolean[][];
	}[]
>([]);
