<script>
	import Header from "../components/Header.svelte";

</script>


<Header />

<div class="main-content">

    <slot>
        
    </slot>

</div>

<footer>

    <div>
        CSCI 499 Capstone Project
    </div>
    <div>
        made with Svelte, AssemblyScript, WASM, and a lot of bitwise math
    </div>
    
</footer>
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

    footer {
        margin-top: 10%;
    }

    .main-content {
        margin-top: 2%;
    }

</style>