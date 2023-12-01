export function createCroppedCanvas(
    width: number, height: number, 
    image: HTMLImageElement,
    center: { x: number, y: number },
    scale: { x: number, y: number }) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  /*
  ctx.fillStyle = '#444480';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  */
  
  const imageWidth = image.width * scale.x;
  const imageHeight = image.height * scale.y;

  const x = center.x - imageWidth / 2;
  const y = center.y - imageHeight / 2;
  ctx.drawImage(image, x, y, imageWidth, imageHeight);

  return canvas;
}

export function drawCaption(canvas: HTMLCanvasElement, caption: string, position: { x: number, y: number }, size: number) {
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = canvas.width;
  tmpCanvas.height = canvas.height;
  const tmpCtx = tmpCanvas.getContext('2d')!;
  tmpCtx.font = `bold ${size}px '源暎エムゴ'`;
  // tmpCtx.font = "normal 40px 'Zen Maru Gothic'";
  // tmpCtx.font = "normal 40px 'Noto Sans JP'";
  // tmpCtx.font = "normal 40px 'Kosugi Maru'";
  // tmpCtx.font = "bold 40px '源暎アンチック'";

  tmpCtx.fillStyle = 'white';
  tmpCtx.textAlign = 'center';
  tmpCtx.textBaseline = 'middle';
  tmpCtx.fillText(caption, canvas.width * position.x, canvas.height * position.y);

  tmpCtx.globalCompositeOperation = 'destination-over';
  tmpCtx.strokeStyle = "black";
  tmpCtx.lineWidth = 8;
  tmpCtx.lineJoin = 'round';
  tmpCtx.strokeText(caption, canvas.width * position.x, canvas.height * position.y);

  const ctx = canvas.getContext('2d')!;
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

