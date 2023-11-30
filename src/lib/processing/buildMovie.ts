import {
  FFmpeg,
  type FFmpegConfigurationGPLExtended,
} from '@diffusion-studio/ffmpeg-js';
import { createCroppedCanvas, drawCaption } from './imageEdit';

export interface RawScene {
  key: number;
  image: string,
  position: { x: number, y: number };
  scale: { x: number, y: number };
  caption: string;
}

export interface Scene {
  key: number;
  canvas: HTMLCanvasElement;
}

export async function createOverlayedVideo(w: number, h: number, d: number, scenes: Scene[], source: Blob): Promise<string> {
  const ffmpeg = new FFmpeg<FFmpegConfigurationGPLExtended>({
    config: 'gpl-extended',
  });
  await waitForReady(ffmpeg);

  // 下レイヤー
  await ffmpeg.writeFile('back.mp4', source);

  // 上レイヤー
  await createVideoWithImages(ffmpeg, w, h, d, scenes);

  // フィルターコンプレックスを使って動画をオーバーレイ
  console.log("************************************** B");
  await ffmpeg.exec([
    '-i', 'back.mp4', '-i', 'front.mp4',
    '-filter_complex', '[0:v][1:v]overlay=format=auto',
    'output.mp4'
  ]);

  const result = ffmpeg.readFile('output.mp4');
  const blob = new Blob([result], { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);
  return url;
}

async function createVideoWithImages(ffmpeg: FFmpeg<FFmpegConfigurationGPLExtended>, w: number, h: number, d: number, scenes: Scene[]): Promise<string> {
  console.log('createVideoWithImages');
  // 各画像をファイルシステムに書き込む
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    await writeCanvasToFile(ffmpeg, scene.canvas, `image${i}.png`);
  }

  // 各画像の表示時間を設定するファイルを作成
  let fileListString = "";
  for (let i = 0; i < scenes.length; i++) {
    fileListString += `file 'image${i}.png'\n`;
    const nextKey = i < scenes.length - 1 ? scenes[i + 1].key : d;
    const duration = nextKey - scenes[i].key;
    fileListString += `duration ${duration}\n`;
  }

  // concatは最後の画像のdurationを無視するらしい
  fileListString += `file 'image${scenes.length - 1}.png'\nduration 0\n`;

  console.log(fileListString);

  // ファイルリストをテキストファイルに書き込む
  const fileListFilename = 'filelist.txt';
  const fileListBlob = new Blob([fileListString], { type: 'text/plain' });
  await ffmpeg.writeFile(fileListFilename, fileListBlob);

  console.log(await ffmpeg.codecs());

  // 画像を連結して動画を作成
  console.log("************************************** A");
  await ffmpeg.exec([
    '-f', 'concat', '-safe', '0', '-i', fileListFilename, 
    '-vcodec', 'libvpx-vp9',
    '-vsync', 'vfr', '-pix_fmt', 'yuva420p',
    '-s', `${w}x${h}`,
    'front.mp4'
  ]);
}


async function createSolidVideo(ffmpeg: FFmpeg<FFmpegConfigurationGPLExtended>, filename: string, color: string, w: number, h: number, duration: number): Promise<void> {
  await ffmpeg.exec([
    '-f', 'lavfi', 
    '-i', `color=c=${color}:s=${w}x${h}:r=30:d=${duration}`,
    '-vcodec', 'h264',
    filename
  ]);
}

async function waitForReady(ffmpeg: FFmpeg<FFmpegConfigurationGPLExtended>): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg.whenReady(() => resolve());
  });
}

async function writeCanvasToFile(ffmpeg: FFmpeg<FFmpegConfigurationGPLExtended>, canvas: HTMLCanvasElement, filename: string): Promise<void> {
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

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
    img.src = url;
  });
}

export async function buildScenes(w: number, h: number, scenesData: Array<RawScene>): Promise<Scene[]> {
  const promises = scenesData.map((sceneData) => 
    loadImage(sceneData.image)
      .then(img => {
        const sourcePosition = sceneData.position;
        const position = { x: sourcePosition.x * w, y: sourcePosition.y * h };
        const canvas = createCroppedCanvas(w, h, img, position, sceneData.scale);
        drawCaption(canvas, sceneData.caption);
        return { ...sceneData, canvas };
      })
      .catch(() => {
        throw new Error(`Failed to load image at ${sceneData.image}`);
      })
  );

  try {
    return await Promise.all(promises);
  } catch (error) {
    // 失敗した場合にエラーメッセージと共に失敗したURLを表示
    console.error(error);
    throw new Error('Failed to build scenes due to an image loading error.');
  }
}
