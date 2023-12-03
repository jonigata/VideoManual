<script lang="ts">
  import Receiver from "./lib/Receiver.svelte";
  import Editor from "./lib/editor/Editor.svelte";
  import Font from "./lib/Font.svelte";
  import { SvelteToast } from '@zerodevx/svelte-toast'

  let file: File | null = null;

  function onDrop(e: CustomEvent<File>) {
    console.log("drop");
    file = e.detail;
  }
</script>

<div class="app-box">
  {#if file != null}
    <Editor bind:file={file}/>
  {:else}
    <div style="width: 1280px;height: 720px;">
      <Receiver on:drop={onDrop}/>
    </div>
  {/if}
  <div hidden>
    <Font/>
  </div>
</div>

<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />

<style>
  .app-box {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  @font-face {
    font-family: '源暎エムゴ';
    src: url('./assets/fonts/GenEiMGothic2-Black.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: '源暎アンチック';
    src: url('./assets/fonts/GenEiAntiqueNv5-M.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 2rem;
    --toastContainerLeft: calc(50vw - 8rem);
    --toastBorderRadius: 0.5rem;
  }
</style>
