<script lang="ts">
	import highScore, { highScoreInfo, implemented_games } from "$lib/highscore";
	import { rom_name as rom_name_store } from "$lib/stores/cpu_state";
	import { onMount } from "svelte";
	import config from "../cpu_configs";
	import BadWordsFilter from "bad-words"; // genuinely awful library, feel free to replace

    let submit_dialog: any;
    let error_dialog: any;
    let name: string = ""
    
    let score = 0

    const filter = new BadWordsFilter()

    $: rom_name = $rom_name_store.substring(0, $rom_name_store.length - 4)
    onMount(() => {
        submit_dialog = document.querySelector("#submit-dialog");
        error_dialog = document.querySelector("#error-dialog");
    })


    const openModal = (e: MouseEvent) => {
        if (!implemented_games.includes(rom_name))
        {
            error_dialog?.showModal();
        }
        else {
            score = highScore()!
            submit_dialog?.showModal();    
        }
    }

    const handleScoreSubmit = async () => {

        if (filter.isProfane(name)) {
            name = ""
            return;
        }

        const res = await fetch(`${config.backend_url}/highscores`, {
            method:"POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(
                {
                    name: name,
                    score: score,
                    game: rom_name
                })
        });

        const data = await res.json()
        console.log(data)
        submit_dialog.close()

    }

</script>

<dialog id="submit-dialog">
    <div>
        score: {score}
    </div>
    <div>
        enter your name: <input type="text" bind:value={name}>
    </div>
    <div>
        <button on:click={() => submit_dialog?.close()}>cancel</button>
        <button on:click={handleScoreSubmit}>submit</button>

    </div>
</dialog>

<dialog id="error-dialog">
    <div>
        sorry! no highscores implemented for this game, try one of the following games instead:
        {#each implemented_games as game}
         <div>
             - {game}
         </div>
        {/each}
    </div>
    <button on:click={() => error_dialog?.close()}>cancel</button>
</dialog>

<button on:click={openModal}>
    submit highscore
</button>

<style>

    button {
        font-size: 20px;
    }

</style>

