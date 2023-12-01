import { type Screen, transform, cycle, easeIn, easeOut, easeOutCubic, easeRange, curveGradient } from './animation';
import { drawCaption, loadImage } from './imageEdit'

function* square(size: number, speed: number): Generator<void, void, Screen> {
  while (true) {
    const scr = yield;
    const { ctx, w, h, elapsed } = scr;
    const s = (scr.w + scr.h) / 2 * size;
    transform(
      scr,
      { x: -elapsed*speed, y: h * 0.5 - s*1.4, w: s, h: s, rotate: -elapsed * 3, scale: 1 },
      () => {
        ctx.strokeStyle = '#FFFBA2';
        ctx.lineWidth = 10;
        ctx.globalAlpha = Math.sin(Math.min(elapsed * 1000 / 230, Math.PI));
        ctx.strokeRect(-s * 0.5, -s * 0.5, s * 2, s * 2);
      });
  }
}

function* wall(endWidth: number, side: string): Generator<void, void, Screen> {
  while (true) {
    let {ctx, w, h, elapsed} = yield;

    const color = '#ACB2FF';
    const startWidth = w * 0.5;

    const cw = easeRange(easeOutCubic, startWidth, endWidth, elapsed);
    const width2 = cw + w * 0.05;
    const curveStart = cw / width2;

    if (side === 'left') {
      const grad = ctx.createLinearGradient(0 , 0 , width2, 0) ;
      curveGradient(grad, color, 16, v => easeOut(1-v), 0, curveStart, 1);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width2, h);
    } else {
      const grad = ctx.createLinearGradient(w, 0, w - width2, 0); 
      curveGradient(grad, color, 16, v => easeOut(1-v), 0, curveStart, 1);
      ctx.fillStyle = grad;
      ctx.fillRect(w - width2, 0, width2, h);
    }
  }
}

function* face(image: HTMLImageElement): Generator<void, void, Screen> {
  const scale = { x: 0.6, y: 0.6 };

  const startX = 1.2;
  const endX = 0.85;
  const startY = 0.8;

  while (true) {
    let {ctx, w, h, elapsed} = yield;
    const center = { x: easeRange(easeOutCubic, startX, endX, elapsed) * w, y: startY * h};
    console.log(center);

    // draw image
    const imageWidth = image.width * scale.x;
    const imageHeight = image.height * scale.y;
  
    const x = center.x - imageWidth / 2;
    const y = center.y - imageHeight / 2;
    ctx.drawImage(image, x, y, imageWidth, imageHeight);
  }
}

function* label(caption: string): Generator<void, void, Screen> {
  while (true) {
    let {ctx, w, h, elapsed} = yield;
    ctx.globalAlpha = easeRange(easeOutCubic, 0, 1, elapsed);
    drawCaption(ctx.canvas, caption, { x: 0.5, y: 0.5 }, 80);
  }
}


async function setUpOpeningGenerators(wallWidth: number) {
  const smile = await loadImage('smile.png');

  const gs: Generator<void, void, Screen>[] = [];
  gs.push(wall(wallWidth, 'left'));
  gs.push(wall(wallWidth, 'right'));
  gs.push(square(0.04, 300));
  gs.push(square(0.045, 450));
  gs.push(square(0.05, 700));
  gs.push(face(smile));
  gs.push(label('フキダシつき画像を作ろう'));
  return gs;
}

export async function renderOpeningToSingleCanvas(canvas: HTMLCanvasElement, wallWidth: number, caption: string) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const duration = 2;
  const fps = 30;
  const elapsed = 0;

  const gs = await setUpOpeningGenerators(wallWidth);

  const scr: Screen = { ctx, w, h, duration, fps, elapsed };
  await cycle(
    elapsed => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);
      return {...scr, elapsed}
    },
    canvas => {}, 
    gs);
} 

export async function renderOpeningToMultipleCanvases(w: number, h: number, wallWidth: number, caption: string): Promise<HTMLCanvasElement[]> {
  const duration = 2;
  const fps = 30;

  const gs = await setUpOpeningGenerators(wallWidth);
  const canvases: HTMLCanvasElement[] = [];

  await cycle(
    elapsed => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      return { ctx, w, h, duration, fps, elapsed };
    },
    (canvas: HTMLCanvasElement) => {
      canvases.push(canvas);
    },
    gs);

  return canvases;
}
