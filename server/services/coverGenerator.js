'use strict';

const { createCanvas, loadImage } = require('canvas');

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function generateCover(seed, index, title, artist, genre) {
  const size = 300;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const picsumSeed = encodeURIComponent(`${seed}:${index}`);
  const picsumUrl = `https://picsum.photos/seed/${picsumSeed}/${size}/${size}`;

  try {
    const img = await loadImage(picsumUrl);
    ctx.drawImage(img, 0, 0, size, size);
  } catch {
    const fallback = ctx.createLinearGradient(0, 0, size, size);
    fallback.addColorStop(0, '#1a1a2e');
    fallback.addColorStop(1, '#16213e');
    ctx.fillStyle = fallback;
    ctx.fillRect(0, 0, size, size);
  }

  const overlayH = Math.floor(size * 0.52);
  const overlayTop = size - overlayH;
  const imageData = ctx.getImageData(0, overlayTop, size, overlayH);
  const data = imageData.data;
  for (let i = 0; i < overlayH; i++) {
    const t = i / (overlayH - 1);
    const alpha = Math.pow(t, 1.6) * 0.82; 
    for (let col = 0; col < size; col++) {
      const idx = (i * size + col) * 4;
      data[idx]     = Math.round(data[idx]     * (1 - alpha)); 
      data[idx + 1] = Math.round(data[idx + 1] * (1 - alpha)); 
      data[idx + 2] = Math.round(data[idx + 2] * (1 - alpha)); }
  }
  ctx.putImageData(imageData, 0, overlayTop);

  const pad = size * 0.06;
  const maxW = size - pad * 2;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 8;

  const titleSize = Math.max(15, Math.min(32, size * 0.105));
  ctx.font = `bold ${titleSize}px sans-serif`;
  const titleLines = wrapText(ctx, title.toUpperCase(), maxW);

  const artistSize = Math.max(11, Math.min(18, size * 0.062));
  ctx.font = `500 ${artistSize}px sans-serif`;
  const artistLines = wrapText(ctx, artist, maxW);

  const titleLineH = titleSize * 1.15;
  const artistLineH = artistSize * 1.2;
  const totalH = titleLines.length * titleLineH + artistLines.length * artistLineH + size * 0.03;
  let y = size - pad - totalH + titleLineH;

  ctx.font = `bold ${titleSize}px sans-serif`;
  ctx.fillStyle = '#ffffff';
  for (const line of titleLines) {
    ctx.fillText(line, pad, y);
    y += titleLineH;
  }

  y += size * 0.02;

  ctx.font = `bold ${artistSize}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  for (const line of artistLines) {
    ctx.fillText(line, pad, y);
    y += artistLineH;
  }

  ctx.shadowBlur = 0;
  return canvas.toDataURL('image/jpeg', 0.88);
}

module.exports = { generateCover };