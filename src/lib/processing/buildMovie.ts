import {
  FFmpeg,
  type FFmpegConfigurationGPLExtended,
} from '@diffusion-studio/ffmpeg-js';
import { drawCaption, loadImage } from './imageEdit';
import { drawWall, renderOpeningToMultipleCanvases } from './opening';

export interface RawScene {
  key: number;
  image: string,
  position: { x: number, y: number };
  scale: { x: number, y: number };
  caption: string;
  captionPosition: 'upper' | 'lower';
}

export interface Scene {
  key: number;
  canvas: HTMLCanvasElement;
}

const ffmpeg = new FFmpeg<FFmpegConfigurationGPLExtended>({
  config: 'gpl-extended',
});

function calculrateWallWidth(w: number, h: number, sw: number, sh: number): number {
  // 動画を、アスペクト比を維持したまま外枠の最大内接矩形にリサイズししたとき、
  // その残りの半分が壁の幅
  const wallWidth = (w - h * sw / sh) / 2;
  return wallWidth;
}

export async function createOverlayedVideo({w, h}: {w: number, h: number}, {sw, sh}: {sw: number, sh: number}, title: string, scenes: Scene[], source: Blob, onProgress:(progress:number)=>void): Promise<string> {
  const wallWidth = calculrateWallWidth(w, h, sw, sh);

  await waitForReady();
  onProgress(10);

  const meta = await ffmpeg.meta(source);
  const fps = meta.streams.video[0].fps ?? 30;
  const duration = meta.duration!;

  // BGM
  await createBGM();

  // 下レイヤー
  await ffmpeg.writeFile('back.mp4', source);
  onProgress(20);

  // オープニング
  await createOpeningMovie(w, h, fps, wallWidth, title);
  onProgress(40);

  // 台本
  ffmpeg.onProgress((progress) => { console.log('progress', progress); });
  await createVideoWithImages(w, h, fps, duration, scenes);
  onProgress(70);

  // フィルターコンプレックスを使って動画をオーバーレイ
  console.log("************************************** C");
  await ffmpeg.exec([
    '-i', 'back.mp4', '-i', 'opening.mov', '-i', 'front.mov',
    '-filter_complex', 
    `[1:v][2:v]concat=n=2:v=1:a=0[front];
    [0:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2[back_scaled];
    [back_scaled][front]overlay=0:0:shortest=1`,
    'video.mp4'
  ]);
  onProgress(90);

  // BGMを合成
  if (0 < meta.streams.audio.length) {
    await ffmpeg.exec([
      '-i', 'video.mp4', 
      '-i', 'bgm.mp3',
      '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=shortest',
      '-c:v', 'copy', 
      '-c:a', 'aac', 
      'output.mp4'
    ]);
  } else {
    await ffmpeg.exec([
      '-i', 'video.mp4',
      '-i', 'bgm.mp3',
      '-map', '0:v',
      '-map', '1:a',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      'output.mp4'
    ]);
  }
  onProgress(100);

  const result = ffmpeg.readFile('output.mp4');
  const blob = new Blob([result], { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);
  return url;
}

async function createBGM() {
  try {
    const response = await fetch('./Osampo_Biyori.mp3');
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const blob = await response.blob();
    await ffmpeg.writeFile('bgm.mp3', blob);
  } catch (error) {
    console.error('Error fetching MP3 file:', error);
    throw error; // エラーを再スロー
  }
}

async function createVideoWithImages(w: number, h: number, fps: number, d: number, scenes: Scene[]): Promise<void> {
  console.log('createVideoWithImages', w, h, fps, d);
  // 各画像をファイルシステムに書き込む
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    await writeCanvasToFile(scene.canvas, `image${i}.png`);
  }

  // 各画像の表示時間を設定するファイルを作成
  let fileListString = "";
  let totalDuration = 0;
  for (let i = 0; i < scenes.length; i++) {
    fileListString += `file 'image${i}.png'\n`;
    const nextKey = i < scenes.length - 1 ? scenes[i + 1].key : d;
    const currKey = i === 0 ? 2 : scenes[i].key;
    const duration = nextKey - currKey;
    fileListString += `duration ${duration}\n`;
    totalDuration += duration;
  }
  fileListString += `file 'image${scenes.length - 1}.png'\n`;

  console.log("================ totalDuration", totalDuration);
  console.log(fileListString);

  // ファイルリストをテキストファイルに書き込む
  const fileListFilename = 'filelist.txt';
  const fileListBlob = new Blob([fileListString], { type: 'text/plain' });
  await ffmpeg.writeFile(fileListFilename, fileListBlob);

  // console.log(await ffmpeg.codecs());

  // 画像を連結して動画を作成
  console.log("************************************** B");
  await ffmpeg.exec([
    '-f', 'concat', 
    '-safe', '0', 
    '-i', fileListFilename, 
    '-vcodec', 'prores_ks',
    '-s', `${w}x${h}`,
    '-r', `${fps}`,
    'front.mov'
  ]);
}

async function createOpeningMovie(w: number, h: number, fps: number, wallWidth: number, caption: string) {
  const canvases = await renderOpeningToMultipleCanvases(w, h, fps, wallWidth, caption);

  // 各画像をファイルシステムに書き込む
  console.log("************************************** A", canvases.length);
  for (let i = 0; i < canvases.length; i++) {
    // document.body.appendChild(canvases[i]);
    await writeCanvasToFile(canvases[i], `opening${i}.png`);
  }

  // canvasの作成
  // ffmpeg -framerate 24 -i image%03d.jpg -c:v libx264 -pix_fmt yuv420p output.mp4
  await ffmpeg.exec([
    '-framerate', '30', '-i', 'opening%d.png',
    '-vcodec', 'prores_ks',
    '-s', `${w}x${h}`,
    '-r', `${fps}`,
    'opening.mov'
  ]);
}

async function createSolidVideo(filename: string, color: string, w: number, h: number, duration: number): Promise<void> {
  await ffmpeg.exec([
    '-f', 'lavfi', 
    '-i', `color=c=${color}:s=${w}x${h}:r=30:d=${duration}`,
    '-vcodec', 'h264',
    filename
  ]);
}

async function waitForReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg.whenReady(() => resolve());
  });
}

async function writeCanvasToFile(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async blob => {
      if (blob) {
        await ffmpeg.writeFile(filename, blob);
        resolve();
      } else {
        reject(new Error('Failed to create Blob from canvas'));
      }
    }, 'image/png');
  });
}

async function drawScene({w, h}: {w: number, h: number}, {sw, sh}: {sw: number, sh: number}, scene: RawScene, last: boolean): Promise<Scene> {
  const wallWidth = calculrateWallWidth(w, h, sw, sh);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const wallPaper = await loadImage('wall.png');
  drawWall(wallWidth, 'left', wallPaper, { ctx, w, h, elapsed: 3.0 });
  drawWall(wallWidth, 'right', wallPaper, { ctx, w, h, elapsed: 3.0 });

  const image = await loadImage(scene.image+".png");
  const iw = image.naturalWidth * scene.scale.x;
  const ih = image.naturalHeight * scene.scale.y;

  const x = scene.position.x * w - iw / 2;
  const y = scene.position.y * h - ih / 2;
  ctx.drawImage(image, x, y, iw, ih);

  let captionPosition = { x: 0.5, y: 0.5 };
  if (scene.captionPosition == "upper") {
    captionPosition = { x: 0.5, y: 0.05 };
  } else {
    captionPosition = { x: 0.5, y: 0.95 };
  }

  drawCaption(ctx, scene.caption, captionPosition, 50);

  if (last) {
    drawCaption(ctx, "BGM: Otologic" , {x:0.1, y:0.95}, 30);
  }

  return { ...scene, canvas };
}

export async function buildScenes({w, h}: {w: number, h: number}, {sw, sh}: {sw: number, sh: number}, scenesData: RawScene[]): Promise<Scene[]> {
  const promises = scenesData.map((sceneData, i) => drawScene({w, h}, {sw, sh}, sceneData, i === scenesData.length - 1));

  try {
    return await Promise.all(promises);
  } catch (error) {
    // 失敗した場合にエラーメッセージと共に失敗したURLを表示
    console.error(error);
    throw new Error('Failed to build scenes due to an image loading error.');
  }
}
