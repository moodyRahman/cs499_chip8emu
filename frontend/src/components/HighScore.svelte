<script lang="ts">

const handleSubmit = (e: MouseEvent) => {
    console.log("submittin")
} 

</script>

<button on:click={handleSubmit}>
    submit highscore
</button>

<style>

    button {
        font-size: 20px;
    }

</style>

