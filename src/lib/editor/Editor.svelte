<script lang="ts">
  import HBox from "../layout/HBox.svelte";
  import VBox from "../layout/VBox.svelte";
  import Script from "./Script.svelte";
  import { type RawScene, createOverlayedVideo, buildScenes } from '../processing/buildMovie';
  import { Button, Progressbar, Input }  from "flowbite-svelte";

  export let file: File;

  let sourceVideo: string = URL.createObjectURL(file);
  let generatedVideo: string = '';
  let generate = -1;
  let title: string="フキダシつき画像を作ろう！";
  let script: RawScene[] = [];
  let sourceVideoElement: HTMLVideoElement;

  let trackSrc = '';
  let srclang = 'en';
  let label = 'english_captions';
  let { sw, sh } = { sw: 1280, sh: 640 };    // videoそのもののサイズ
  let { w, h } = { w: 1280, h: 640 };        // elementのサイズ
  let loaded = false;

  function onLoadedMetaData(e: Event) {
    const video = e.target as HTMLVideoElement;
    sw = video.videoWidth;
    sh = video.videoHeight;
    loaded = true;
  }

  async function onGenerate() {
    generate = 0;
    const scenes = await buildScenes({w, h}, {sw, sh}, script);
    generate = 50;
    generatedVideo = await createOverlayedVideo({w, h}, {sw, sh}, 5, title, scenes, file, progress => generate = progress);
    generate = 100;

    await new Promise(resolve => setTimeout(resolve, 1000));
    generate = -1;
    /*
    const a = document.createElement('a');
    a.href = videoSource;
    a.download = 'black_background.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
*/
  }


</script>

<HBox className="p-16 gap-16">
  <VBox className="w-1/2 gap-8">
    <Input type="text" id="title" placeholder="タイトル" size="lg" bind:value={title} required/>
    {#if sourceVideoElement != null}
      <Script bind:script={script} sourceVideo={sourceVideoElement}/>
    {/if}
  </VBox>
  <VBox className="w-1/2 gap-8">
    <video class="video" controls src={sourceVideo} on:loadedmetadata={onLoadedMetaData} bind:this={sourceVideoElement}> 
      <track src={trackSrc} kind="captions" {srclang} {label} />
      Your browser does not support the video tag.
    </video>
    {#if 0 <= generate}
      <Progressbar progress={generate} />      
    {:else}
      <Button color="blue" class="w-full" on:click={onGenerate} disabled={!loaded}>生成</Button>
    {/if}
    {#if generatedVideo !== ''}
      <video class="video" controls src={generatedVideo}>
        <track src={trackSrc} kind="captions" {srclang} {label} />
        Your browser does not support the video tag.
      </video>
    {/if}
    <div hidden>
      <span style="font-family: '源暎エムゴ';">源暎エムゴ</span>
      <span style="font-family: '源暎アンチック';">源暎アンチック</span>
    </div>
  </VBox>
</HBox>

<style>
  .video {
    width: 640px;
    height: 360px;
  }
  
</style>