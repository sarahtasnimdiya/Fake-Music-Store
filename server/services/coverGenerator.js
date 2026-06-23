'use strict';

const { createCanvas, loadImage } = require('canvas');

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function wrapLines(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) { lines.push(cur); cur = w; }
    else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

async function generateCover(seed, index, title, artist, genre) {
  const size = 300;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  try {
    const img = await loadImage(`https://picsum.photos/seed/${encodeURIComponent(`${seed}:${index}`)}/${size}/${size}`);
    ctx.drawImage(img, 0, 0, size, size);
  } catch {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);
  }

  const overlayH = Math.floor(size * 0.52);
  const overlayTop = size - overlayH;
  const imageData = ctx.getImageData(0, overlayTop, size, overlayH);
  const data = imageData.data;
  for (let i = 0; i < overlayH; i++) {
    const alpha = Math.pow(i / (overlayH - 1), 1.6) * 0.82; 
    for (let col = 0; col < size; col++) {
      const idx = (i * size + col) * 4;
      data[idx]     = Math.round(data[idx]     * (1 - alpha)); 
      data[idx + 1] = Math.round(data[idx + 1] * (1 - alpha)); 
      data[idx + 2] = Math.round(data[idx + 2] * (1 - alpha)); }
  }
  ctx.putImageData(imageData, 0, overlayTop);

  const photoB64 = canvas.toDataURL('image/jpeg', 0.88).split(',')[1];

  const lines = wrapLines(title.toUpperCase(), 16);
  const titleY = size - 28 - (lines.length - 1) * 25;
  const tspans = lines.map((l, i) => `<tspan x="14" dy="${i === 0 ? 0 : 25}">${esc(l)}</tspan>`).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs><filter id="sh"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.8"/></filter></defs>
  <image href="data:image/jpeg;base64,${photoB64}" x="0" y="0" width="${size}" height="${size}"/>
  <text x="14" y="${titleY}" font-family="Arial,sans-serif" font-weight="800" font-size="22" fill="#fff" filter="url(#sh)">${tspans}</text>
  <text x="14" y="${size - 10}" font-family="Arial,sans-serif" font-weight="600" font-size="12" fill="#e8e8e8" filter="url(#sh)">${esc(artist.toUpperCase())}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}


module.exports = { generateCover };