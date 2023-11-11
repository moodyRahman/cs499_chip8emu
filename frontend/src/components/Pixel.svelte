<script lang="ts">
    export let pixel: number;
    $: pixel = 0
</script>


<span
        style:background-color={pixel === 0?"white":"black"}
>
<pre>   </pre>
</span>


<style>
    pre {
        display: inline;
        width: 10px;
    }

    @media only screen and (max-width: 800px) {
        pre {
            width: 20px;
        }
    }

    span {
        width: 10px;
    }
</style>