<script lang="ts">
  import FileDropZone from "./lib/FileDropZone.svelte";
  import HBox from "./lib/layout/HBox.svelte";
  import VBox from "./lib/layout/VBox.svelte";
  import Script from "./Script.svelte";
  import { type RawScene, createOverlayedVideo, buildScenes } from './lib/processing/buildMovie';
  import { onMount } from "svelte";
  import Font from "./lib/Font.svelte";
  import Dropzone from "svelte-file-dropzone/Dropzone.svelte";

//  let videoSource: string = "./6c14a8db-b57f-4fd7-82ac-4be607484725.mp4";
  let sourceVideo: string = '';
  let generatedVideo: string = "./black_background.mp4";

  let trackSrc = '';
  let srclang = 'en';
  let label = 'english_captions';
  let { sw, sh } = { sw: 640, sh: 360 };    // videoそのもののサイズ
  let { w, h } = { w: 640, h: 360 };        // elementのサイズ
  let file: File;

  let inputElement: HTMLInputElement;

  async function onClick() {
    const script: RawScene[] = [
      { 
        key: 0,
        image: 'smile.png',
        position: { x: 0.85, y: 0.6 },
        scale: { x: 0.4, y: 0.4 },
        caption: 'FramePlannerのチップスだよ！'
      },
      { 
        key: 2,
        image: 'standard.png',
        position: { x: 0.85, y: 0.6 },
        scale: { x: 0.4, y: 0.4 },
        caption: 'なるほどね～'
      },
      { 
        key: 4,
        image: 'goodbye.png',
        position: { x: 0.85, y: 0.6 },
        scale: { x: 0.4, y: 0.4 },
        caption: 'またね！'
      },
    ];
    const scenes = await buildScenes(sw, sh, script);
    generatedVideo = await createOverlayedVideo(sw, sh, 5, scenes, file);
/*
    const a = document.createElement('a');
    a.href = videoSource;
    a.download = 'black_background.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
*/
  }

  function onDrop(e) {
    const { acceptedFiles } = e.detail;
    file = acceptedFiles[0];
    sourceVideo = URL.createObjectURL(file);
    trackSrc = sourceVideo;
  }

  function onLoadedMetaData(e: Event) {
    const video = e.target as HTMLVideoElement;
    sw = video.videoWidth;
    sh = video.videoHeight;
    // sw = 640;
    // sh = 360;
    w = video.clientWidth; // コンテナまたはビデオの現在の幅
    var aspectRatio = sh / sw;
    h = w * aspectRatio;
    video.style.height = h + 'px'; // 新しい高さを設定
    console.log(w, h);
  }

  onMount(async () => {
  });

</script>

<div class="app-box">
  <HBox className="p-16 gap-16">
    <Script/>
    <VBox className="w-1/2 gap-8">
      <div>
        <Dropzone on:dropaccepted={onDrop} accept="video/*" inputElement={inputElement}>
          <div class="drop-zone">
            <div class="text-center">
              <p class="text-lg">ファイルをここにドロップ</p>
              <p class="text-sm text-gray-500">またはクリックしてファイルを選択</p>
            </div>
          </div>
        </Dropzone>
        <input type="file" class="hidden" accept=".mp4,.avi,.mov,.webm" bind:this={inputElement}>
      </div>
      <div class="h-full flex flex-col gap-2 items-center">
        <div id="videoContainer" style="width: 100%; max-width: 640px; /* この幅が最大値 */">
          <video class="video" controls src={sourceVideo} on:loadedmetadata={onLoadedMetaData}> 
            <track src={trackSrc} kind="captions" {srclang} {label} />
            Your browser does not support the video tag.
          </video>
        </div>
        <button class="w-full" on:click={onClick}>生成</button>
        <video class="video" controls src={generatedVideo}  style="width: {w}px; height: {h}px;">
          <track src={trackSrc} kind="captions" {srclang} {label} />
          Your browser does not support the video tag.
        </video>
      </div>
      <div hidden>
        <span style="font-family: '源暎エムゴ';">源暎エムゴ</span>
        <span style="font-family: '源暎アンチック';">源暎アンチック</span>
        <Font/>
      </div>
    </VBox>
  </HBox>
</div>

<style>
  .app-box {
    width: 100vw;
    height: 100vh;
  }
  .video {
    width: 640px;
    height: 360px;
  }
  .drop-zone {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
    width: 480px;
    height: 200px;
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
</style>
