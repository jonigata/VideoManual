<script lang="ts">
	import { FileDrop } from 'svelte-droplet'
  import { createEventDispatcher } from "svelte";
  import { createVoice } from "./processing/voice";
  import Motion from "./Motion.svelte";

  let audio: HTMLAudioElement;

  const dispatch = createEventDispatcher();

  function onDrop(files: File[]) {
    if (files.length === 0) return;
    dispatch("drop", files[0]);
  }

  async function onVoice() {
    const mp3 = await createVoice("私はフレームプランナーの精です");
    const url = URL.createObjectURL(mp3);
    audio.src = url;
    audio.play();
  }
</script>

<FileDrop handleFiles={onDrop} acceptedMimes={["video/*"]} let:droppable>
	<div class="drop-zone" class:droppable>ムービーをここにドロップ</div>
</FileDrop>
<div hidden>
  <button on:click={onVoice}>ボイス</button>
  <audio bind:this={audio}>オーディオ</audio>
  <Motion/>
</div>

<style>
  .drop-zone {
    width: 1280px;
    height: 720px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px dashed #4B5563;
    border-radius: 0.5rem;
    background-color: #F3F4F6;
  }  
</style>
