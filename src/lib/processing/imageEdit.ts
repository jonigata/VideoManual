export function drawCaption(ctx: CanvasRenderingContext2D, caption: string, position: { x: number, y: number }, size: number) {
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = ctx.canvas.width;
  tmpCanvas.height = ctx.canvas.height;
  const tmpCtx = tmpCanvas.getContext('2d')!;
  tmpCtx.font = `bold ${size}px '源暎エムゴ'`;
  // tmpCtx.font = "normal 40px 'Zen Maru Gothic'";
  // tmpCtx.font = "normal 40px 'Noto Sans JP'";
  // tmpCtx.font = "normal 40px 'Kosugi Maru'";
  // tmpCtx.font = "bold 40px '源暎アンチック'";

  tmpCtx.fillStyle = 'white';
  tmpCtx.textAlign = 'center';
  tmpCtx.textBaseline = 'middle';
  tmpCtx.fillText(caption, ctx.canvas.width * position.x, ctx.canvas.height * position.y);

  tmpCtx.globalCompositeOperation = 'destination-over';
  tmpCtx.strokeStyle = "black";
  tmpCtx.lineWidth = 10;
  tmpCtx.lineJoin = 'round';
  tmpCtx.strokeText(caption, ctx.canvas.width * position.x, ctx.canvas.height * position.y);

  ctx.drawImage(tmpCanvas, 0, 0);

/*
  const ctx = canvas.getContext('2d')!;
  ctx.font = "bold 40px '源暎エムゴ'";
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(caption, canvas.width / 2, canvas.height * 3 / 4);
*/
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
    img.src = url;
  });
}

