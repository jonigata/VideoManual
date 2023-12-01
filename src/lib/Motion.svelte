<script lang="ts">
  import { renderOpeningToSingleCanvas } from './processing/opening';

let canvas: HTMLCanvasElement;

  async function startOpening() {
    await renderOpeningToSingleCanvas(canvas, 100, "富士山麓オウム鳴く");
  }

</script>

<div class="flex flex-col">
  <canvas width="1280" height="720" style="width:640px; height:360px;" id="canvas" bind:this={canvas}></canvas>
  <button on:click={startOpening}>スタート</button>
</div>

<style>
  
</style>