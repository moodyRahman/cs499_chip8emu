<script lang="ts">
	import { onMount } from "svelte";
	import config from "../../cpu_configs";
	import { implemented_games } from "$lib/highscore";

    let data:{
        game: string,
        name: string,
        score: number
    }[] = []



    onMount(async  () => {
        const res = await fetch(`${config.backend_url}/highscores`)
        data = await res.json()
    })
</script>


<div class="container">
    {#each implemented_games as game}
    <div class="board">
        
        <div class="title">
            {game}
        </div>

        <div class="table">
            {#each ([...data.filter((x) => x.game === game)].slice(0, 10)) as score}
            <div class="row">
                <div>
                    {score.name}
                </div>
                <div>
                    {score.score}
                </div>
            </div>
            {/each}
        </div>
    </div>    
    {/each}
</div>

<style>

    .container {
        display: flex;
        flex-direction: row;
        gap: 5rem;
        width: 100%;
    }

    .table {
        font-size: 1.5rem;
    }

    .table > div {
        display: flex;
        gap: 20px;
    }

    .title {
        font-size: 3rem;
        padding: 10px;
    }

    .row {
        display: flex;
    }

    .row:nth-child(even) {
        background-color: #c76f6f;
    }

    .board {
        width: fit-content;
        background-color: lightcoral;
        border-radius: 4px;
        box-shadow: 10px 10px 0px -1px black;
    }

    .row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-left: 10px;
        padding-right: 10px;

    }
</style>