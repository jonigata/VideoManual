<script lang="ts">
	import { filedrop } from "filedrop-svelte";
	import type { FileDropSelectEvent, FileDropOptions } from "filedrop-svelte";
  import { createEventDispatcher } from "svelte";

	let options: FileDropOptions = { accept: ".mp4,.avi,.mov,.webm" };

  const dispatch = createEventDispatcher();

  function onDrop(event: CustomEvent<FileDropSelectEvent>) {
    if (event.detail.files.accepted.length === 0) return;
    dispatch("drop", event.detail.files.accepted[0]);
  }
</script>

<div class="drop-zone" use:filedrop={options} on:filedrop={onDrop}>
  <p class="text-lg">ファイルをここにドロップ</p>
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
