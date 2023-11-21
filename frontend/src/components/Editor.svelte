<script lang="ts">

</script>


<div class="container">
    <div class="editor">
        <div>
            code editor (wip)
            <button>assemble</button> 
            <button>reset</button> 
            <button>save</button> 
            <button>load</button>
        </div>
        <textarea />
    </div>
    <div class="message">
        convenient spot to display messages from the assembler, might refactor 
        into a global to post messages for the user
    </div>
</div>


<style>
    textarea {
        width: 100%;
        height: 500px;
    }

    .container {
        display:flex;
        gap: 2%;
        width: 90%;
    }

    .editor {
        flex-basis: 50%;
    }

    .message {
        margin-top: 2%;
    }
</style>
