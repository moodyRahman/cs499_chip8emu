<script>
	import Header from "../components/Header.svelte";

</script>

<div class="page">
    
    <Header />
    
    <div class="main-content">
        
    <slot>
        
    </slot>

</div>

<footer>

    <hr />
    
    <div>
        CSCI 499 Capstone Project
    </div>
    <div>
        made with Svelte, AssemblyScript, WASM, and a lot of bitwise math
    </div>
    
</footer>

</div>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

    :global(html) {
        box-sizing: border-box;
    }
    :global(*, *:before, *:after) {
        box-sizing: inherit;
    }

    :global(*) {
        font-family: 'Roboto', sans-serif;
    }

    :global(body) {
        margin-left: 10%;
        margin-right: 10%;
        margin-top: 3%;
        margin-top: 3%;
    }

    hr {
        border: 1px solid lightblue;
        width: 85%;
        margin-bottom: 2rem;
        margin-top: 4rem;
    }

    footer {
        margin-bottom: 1rem;
    }

    .main-content {
        margin-top: 2%;
        height: 105vh;
    }

    .page {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

</style>