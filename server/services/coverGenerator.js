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

  const overlayH = size * 0.52;
  const steps = 60;
  ctx.save();
  ctx.fillStyle = '#000000';
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    ctx.globalAlpha = Math.pow(t, 1.5) * 0.86;
    const y = Math.floor((size - overlayH) + t * overlayH);
    const h = Math.ceil(overlayH / steps) + 2; 
    ctx.fillRect(0, y, size, h);
  }
  ctx.restore();

  const pad = size * 0.06;
  const maxW = size - pad * 2;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 8;

  const titleSize = Math.max(15, Math.min(32, size * 0.105));
  ctx.font = `bold ${titleSize}px Arial, sans-serif`;
  const titleLines = wrapText(ctx, title.toUpperCase(), maxW);

  const artistSize = Math.max(11, Math.min(18, size * 0.062));
  ctx.font = `500 ${artistSize}px Arial, sans-serif`;
  const artistLines = wrapText(ctx, artist, maxW);

  const titleLineH = titleSize * 1.15;
  const artistLineH = artistSize * 1.2;
  const totalH = titleLines.length * titleLineH + artistLines.length * artistLineH + size * 0.03;
  let y = size - pad - totalH + titleLineH;

  ctx.font = `bold ${titleSize}px Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  for (const line of titleLines) {
    ctx.fillText(line, pad, y);
    y += titleLineH;
  }

  y += size * 0.02;

  ctx.font = `500 ${artistSize}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  for (const line of artistLines) {
    ctx.fillText(line, pad, y);
    y += artistLineH;
  }

  ctx.shadowBlur = 0;
  return canvas.toDataURL('image/jpeg', 0.88);
}

module.exports = { generateCover };