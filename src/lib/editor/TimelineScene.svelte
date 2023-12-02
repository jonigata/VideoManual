<script lang="ts">
  import type { RawScene } from '../processing/buildMovie';
  import { TimelineItem, Input, Button, Modal } from 'flowbite-svelte';
  import HBox from "../layout/HBox.svelte";
  import { onMount } from 'svelte';
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let scene: RawScene;
  export let capture: HTMLImageElement;

  let faces = ["smile", "standard", "goodbye"];

  let captureImage: HTMLImageElement;
  let faceChooser = false;

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60).toString().padStart(1, '0');
    const secs = (seconds % 60).toFixed(2).padStart(5, '0');
    return `${mins}:${secs}`;
  };

  function onDelete() {
    dispatch("delete", scene);
  }

  onMount(() => {
    captureImage.src = capture.src;
    capture.onload = () => {
      captureImage.src = capture.src;
    }
  });
</script>

<TimelineItem>
  <div class="header">{formatTime(scene.key)}<Button class="h-6" color="blue" size="xs" on:click={onDelete}>-</Button></div>
  <HBox className="justify-between gap-2">
    <img class="capture" alt="capture" bind:this={captureImage}/>
    <Input type="text" id="caption" placeholder="キャプション" size="lg" bind:value={scene.caption} required/>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img src="./{scene.image}.png" class="face" alt="face" on:click={() => faceChooser = true}/>
  </HBox>
</TimelineItem>

<Modal title="顔選択" bind:open={faceChooser} autoclose>
  <HBox className="justify-center gap-2">
    {#each faces as face}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <img src="./{face}.png" class="face" alt="face" on:click={() => { scene.image = face; faceChooser = false; }}/>
    {/each}
  </HBox>
</Modal>

<style>
  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .capture {
    width: 180px;
    height: 90px;
    min-width: 180px;
    object-fit: contain;
  }
  .face {
    width: 90px;
    height: 90px;
  }
</style>