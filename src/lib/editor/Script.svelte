<script lang="ts">
  import { Label }  from "flowbite-svelte";
  import type { RawScene } from '../processing/buildMovie';
  import { Timeline, Button } from 'flowbite-svelte';
  import TimelineScene from "./TimelineScene.svelte";
  import { tick, onMount } from "svelte";
  import { toast } from '@zerodevx/svelte-toast'
  import HBox from "../layout/HBox.svelte";
	import { FileDrop } from 'svelte-droplet'

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

  function onSave() {
    const json = JSON.stringify(script, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function onLoad(files: File[]) {
    console.log(files);
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target!.result;
      script = JSON.parse(data as string);
      cookedScript = script.map(({key, caption, image}) => {
        const newEntry = createEntry(key, caption, image);
        return newEntry;
      });
    };
    reader.readAsText(file);

  }

  function weaveScript() {
    script = cookedScript.map(({scene}) => scene);
  }

  function createEntry(key: number, caption:string, image: string) {
    const newEntry = {
       scene: { key, caption, image, position: { x: 0.85, y: 0.8 }, scale: { x: 0.6, y: 0.6 }, captionPosition: "lower"  } as RawScene,
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
  <p>一件目は必ず0:02.00にしてください</p>
  <Timeline>
    {#each cookedScript as {scene, capture}}
      <TimelineScene scene={scene} capture={capture} on:delete={onDelete}/>
    {/each}
  </Timeline>
  <HBox className="gap-4">
    <Button on:click={onAdd} disabled={cursor < 2}>+</Button>
    <Button color="green" class="w-32" on:click={onSave}>Save JSON</Button>
    <FileDrop handleFiles={onLoad} acceptedMimes={["application/json"]} let:droppable>
      <div class="drop-zone" class:droppable>JSONをここにドロップ</div>
    </FileDrop>
  </HBox>
</div>

<style>
  .script {
    width: 100%;
    height: 400px;
  }    
  .drop-zone {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px dashed #4B5563;
    border-radius: 0.5rem;
    background-color: #F3F4F6;
    width: 400px;
    height: 40px;
}  
</style>