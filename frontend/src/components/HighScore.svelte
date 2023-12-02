<script lang="ts">
	import highScore from "$lib/highscore";
	import { onMount } from "svelte";

    let dialog: any;
    let name: string = ""
    onMount(() => {
        dialog = document.querySelector("dialog");

    })

    const openModal = (e: MouseEvent) => {
        dialog?.showModal();    
        console.log(highScore())
    }

</script>

<dialog>
    <div>
        enter your name: <input type="text" bind:value={name}>
    </div>
    <div>
        <button on:click={() => dialog?.close()}>cancel</button>
        <button on:click={() => dialog?.close()}>submit</button>

    </div>
</dialog>

<button on:click={openModal}>
    submit highscore
</button>

<style>

    button {
        font-size: 20px;
    }

</style>

