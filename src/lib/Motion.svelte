<script lang="ts">
  import { renderOpeningToSingleCanvas } from './processing/opening';

let canvas: HTMLCanvasElement;

  async function startOpening() {
    await renderOpeningToSingleCanvas(canvas, 100, "富士山麓オウム鳴く");
  }

</script>

<div class="flex flex-col">
  <div class="canvas-container">
    <canvas width="1280" height="720" style="width:640px; height:360px;" id="canvas" bind:this={canvas}></canvas>
  </div>
  <button on:click={startOpening}>スタート</button>
</div>

<style>
  .canvas-container {
    position: relative;
    background-image: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
                      linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc);
    background-size: 20px 20px;
    background-position: 0 0, 10px 10px;
    background-color: white;
    width: 640px;
    height: 360px;
  }
</style>