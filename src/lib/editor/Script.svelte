<script lang="ts">
  import { Label }  from "flowbite-svelte";
  import type { RawScene } from '../processing/buildMovie';
  import { Timeline, TimelineItem, Button } from 'flowbite-svelte';
  import TimelineScene from "./TimelineScene.svelte";
  import { tick, onMount } from "svelte";
  import { toast } from '@zerodevx/svelte-toast'

  export let script: RawScene[] = [];
  export let sourceVideo: HTMLVideoElement;
  
  let cookedScript: { scene: RawScene, capture: HTMLImageElement }[] = [];

  async function captureScene(scene: RawScene, capture: HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const video = document.createElement('video');
      video.src = sourceVideo.src;  
      video.addEventListener('loadedmetadata', async () => {
        video.currentTime = scene.key;
        video.addEventListener('seeked', () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d')!;
          console.log(video.currentTime);
          ctx.drawImage(video, 0, 0);
          capture.src = canvas.toDataURL();
          console.log("capture done");
          resolve(capture);
        }, { once: true });
      }, { once: true });
    });
  }

  async function onAdd() {
    const newEntry = { 
      scene: { key: sourceVideo.currentTime, caption: 'キャプション', image: 'smile', position: { x: 0, y: 0 }, scale: { x: 1, y: 1 } },
      capture: document.createElement('img') 
    };
    captureScene(newEntry.scene, newEntry.capture);
    const newScript = [...cookedScript, newEntry];
    newScript.sort((a, b) => a.scene.key - b.scene.key);
    cookedScript = [];
    await tick();
    cookedScript = newScript;
  }

  onMount(async () => {
    cookedScript = script.map(scene => {
      return {
        scene,
        capture: document.createElement('img')
      };
    });


  });

</script>

<div class="script">
  <Label>台本</Label>
  <Timeline>
    {#each cookedScript as {scene, capture}}
      <TimelineScene scene={scene} capture={capture}/>
    {/each}
  </Timeline>
  <Button on:click={onAdd}>+</Button>
</div>

<style>
  .script {
    width: 100%;
    height: 400px;
  }    
</style>