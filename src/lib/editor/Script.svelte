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
  let cursor = 0;

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
          ctx.drawImage(video, 0, 0);
          capture.src = canvas.toDataURL();
          console.log("capture done");
          resolve(capture);
        }, { once: true });
      }, { once: true });
    });
  }

  async function onAdd() {
    if (cookedScript.find(({scene}) => scene.key == cursor)) {
      toast.push("同じ時間に追加することはできません");
      return;
    }

    const newEntry = createEntry(cursor, 'キャプション', 'smile');
    const newScript = [...cookedScript, newEntry];
    newScript.sort((a, b) => a.scene.key - b.scene.key);
    cookedScript = [];
    await tick();
    cookedScript = newScript;
    weaveScript();
  }

  async function onDelete(e: CustomEvent<RawScene>) {
    const newScript = cookedScript.filter(({scene}) => scene.key != e.detail.key);
    cookedScript = [];
    await tick();
    cookedScript = newScript;
    weaveScript();
  }

  function weaveScript() {
    script = cookedScript.map(({scene}) => scene);
  }

  function createEntry(key: number, caption:string, image: string) {
    const newEntry = {
       scene: { key, caption, image, position: { x: 0.85, y: 0.8 }, scale: { x: 0.6, y: 0.6 }  } ,
       capture: document.createElement('img') 
    };
    captureScene(newEntry.scene, newEntry.capture);
    return newEntry;
  }

  onMount(() => {
    sourceVideo.addEventListener(
      'seeked',
      () => {
        cursor = sourceVideo.currentTime;
      }
    );
    sourceVideo.addEventListener(
      'loadedmetadata',
      () => {
        console.log("loadedmetadata");
        const newEntry = 
        cookedScript = [
          createEntry(2, 'ここから本編', 'standard'),
          createEntry(sourceVideo.duration - 1, 'またね', 'goodbye')
        ];
        weaveScript();
      },
      { once: true }
    );
  });

</script>

<div class="script">
  <Label>台本</Label>
  <Timeline>
    {#each cookedScript as {scene, capture}}
      <TimelineScene scene={scene} capture={capture} on:delete={onDelete}/>
    {/each}
  </Timeline>
  <Button on:click={onAdd} disabled={cursor < 2}>+</Button>
</div>

<style>
  .script {
    width: 100%;
    height: 400px;
  }    
</style>