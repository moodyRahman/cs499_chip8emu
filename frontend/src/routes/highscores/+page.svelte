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
    <div>

        {game}:
        <table>
            <tr>
                <th>name</th>
                <th>score</th>
            </tr>
            
            {#each ([...data.filter((x) => x.game === game)].slice(0, 10)) as score}
            <tr>
                <td>
                    {score.name}
                    
                </td>
                <td>
                    {score.score}
                </td>
            </tr>
            {/each}
        </table>
    </div>    
    {/each}
</div>

<style>

    .container {
        display: flex;
        flex-direction: row;
        gap: 3rem;
    }
</style>