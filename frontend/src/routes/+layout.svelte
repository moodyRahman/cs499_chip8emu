<script>
	import { loading } from "$lib/stores/cpu_state";
	import Header from "../components/Header.svelte";
    import "$lib/css/main.css"
</script>

<div class="page">
    {#if $loading}
    loading...
    {:else}
    <Header />
    
    <div class="main-content">
        
        <slot>
            
        </slot>

    </div>
    {/if}


    <footer>

        <hr/>
        
        <div>
            CSCI 499 Capstone Project
        </div>
        <div>
            made with Svelte, AssemblyScript, WASM, and a lot of bitwise math
        </div>
        <div>
            Nobel "Ken" Prakasam,  Filip "Shmaz_Pootaz" Trzcinka, Moududur "Moody" Rahman  
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
        align-self: stretch;
    }

    .main-content {
        margin-top: 2%;
    }

    .page {
        display: flex;
        flex-direction: column;
    }



</style>