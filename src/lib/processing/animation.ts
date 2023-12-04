export interface Screen {
  w: number;
  h: number;
  duration: number;
  fps: number;
  ctx: CanvasRenderingContext2D;
  elapsed: number;
}

export interface GameObject {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  scale: number;
}

export async function cycle(
  screenGenerator: (elapsed: number) => Screen, 
  screenUpdater: (canvas: HTMLCanvasElement) => void, 
  gs: Generator<void, void, Screen>[]) {

  let elapsed = 0;
  let first = true;
  while (true) {
    const scr = screenGenerator(elapsed);
    const { ctx, fps, duration, w, h } = scr;
    if (duration <= elapsed) break;
    gs.forEach(g => {
      ctx.save();
      g.next(scr);
      ctx.restore();
    });
    if (first) {
      // 最初のフレームはgeneratorの準備ができていないので飛ばす
      first = false;
      continue;
    }
    elapsed += 1 / fps;
    screenUpdater(ctx.canvas);
    const interval = 1000 / fps;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

export function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

export function easeIn(t: number) {
  return Math.pow(t, 2);
}

export function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 2);
}

export function easeInCubic(x: number) {
  return Math.pow(x, 3);
}

export function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

export function easeRange(ease: (t: number) => number, start: number, end: number, elapsed: number) {
  return start + (end - start) * ease(clamp(elapsed, 0, 1));
}

export function transform({ ctx, w, h }: Screen, go: GameObject, f: () => void) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.translate(go.x, go.y);
  ctx.scale(go.scale, go.scale);
  ctx.rotate(go.rotate)
  ctx.translate(-go.w / 2, -go.h / 2);
  f();
  ctx.restore();
  
}

export function curveGradient(
  grad: CanvasGradient, 
  color: string, 
  n: number, 
  easeFunction: (t: number) => number, 
  tStart: number, 
  tEaseStart: number, 
  tEnd: number
): void {
  grad.addColorStop(tStart, `${color}ff`);
  for (let i = 0; i <= n; i++) {
      let t = (i / n) * (tEnd - tEaseStart) + tEaseStart; // tEaseStart から tEnd までの範囲
      console.log(t, i, n, tStart, tEaseStart, tEnd);
      let easeVal = (t - tEaseStart) / (tEnd - tEaseStart); // easeFunction は [0, 1) の範囲で定義
      let alpha = Math.round(easeFunction(easeVal) * 255);
      let hexAlpha = alpha.toString(16).padStart(2, '0');
      grad.addColorStop(t, `${color}${hexAlpha}`);
  }
  grad.addColorStop(tEnd, `${color}00`);
}
