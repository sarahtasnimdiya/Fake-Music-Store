'use strict';
const { rngFor, pick } = require('./rng');
const { getCoverStyles } = require('./genreProfiles');
const SIZE = 320;
function hsl(h,s,l){return `hsl(${Math.round(((h%360)+360)%360)},${s}%,${l}%)`;}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function styleGradientRays(rng,hue){
  const cx=30+rng()*(SIZE-60),cy=30+rng()*(SIZE-60),rays=10+Math.floor(rng()*8);
  let body=`<rect width="${SIZE}" height="${SIZE}" fill="${hsl(hue,55,22)}"/>`;
  for(let i=0;i<rays;i++){
    const a1=(i/rays)*Math.PI*2,a2=((i+0.5)/rays)*Math.PI*2,r=SIZE*1.1;
    body+=`<polygon points="${cx},${cy} ${cx+Math.cos(a1)*r},${cy+Math.sin(a1)*r} ${cx+Math.cos(a2)*r},${cy+Math.sin(a2)*r}" fill="${hsl(hue+i*12,65,38+rng()*20)}" opacity="0.82"/>`;
  }
  return{lightness:30,body};
}

function styleScatteredShapes(rng,hue){
  let body=`<rect width="${SIZE}" height="${SIZE}" fill="${hsl(hue,35,15)}"/>`;
  const n=10+Math.floor(rng()*8);
  for(let i=0;i<n;i++){
    const kind=Math.floor(rng()*3),cx=rng()*SIZE,cy=rng()*SIZE*0.75,r=22+rng()*65;
    const fill=hsl(hue+i*25,62,42+rng()*22),op=(0.32+rng()*0.42).toFixed(2);
    if(kind===0) body+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}"/>`;
    else if(kind===1) body+=`<rect x="${cx-r/2}" y="${cy-r/2}" width="${r}" height="${r}" fill="${fill}" opacity="${op}" transform="rotate(${Math.floor(rng()*45)} ${cx} ${cy})"/>`;
    else body+=`<polygon points="${cx},${cy-r} ${cx+r},${cy+r} ${cx-r},${cy+r}" fill="${fill}" opacity="${op}"/>`;
  }
  return{lightness:22,body};
}

function styleRadialRings(rng,hue){
  const cx=SIZE/2,cy=SIZE/2,rings=6+Math.floor(rng()*5);
  let body=`<rect width="${SIZE}" height="${SIZE}" fill="${hsl(hue,30,12)}"/>`;
  for(let i=rings;i>0;i--) body+=`<circle cx="${cx}" cy="${cy}" r="${(i/rings)*SIZE*0.72}" fill="${hsl(hue+i*16,62,28+i*4)}" opacity="0.88"/>`;
  return{lightness:28,body};
}

function styleTriangleMosaic(rng,hue){
  const cols=5,rows=5,cell=SIZE/cols;
  let body=`<rect width="${SIZE}" height="${SIZE}" fill="${hsl(hue,55,25)}"/>`;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const x=c*cell,y=r*cell,h=hue+(r+c)*14+rng()*18,flip=rng()<0.5;
    const pts=flip?`${x},${y} ${x+cell},${y} ${x},${y+cell}`:`${x+cell},${y} ${x+cell},${y+cell} ${x},${y+cell}`;
    body+=`<polygon points="${pts}" fill="${hsl(h,60,36+rng()*22)}" opacity="0.93"/>`;
  }
  return{lightness:30,body};
}

function styleDarkStreaks(rng,hue){
  let body=`<rect width="${SIZE}" height="${SIZE}" fill="${hsl(hue,22,10)}"/>`;
  const count=5+Math.floor(rng()*4);
  for(let i=0;i<count;i++){
    const y1=rng()*SIZE,y2=y1+(rng()-0.5)*160,w=12+rng()*28,gid=`sk${i}`;
    body+=`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${hsl(hue+i*22,70,42)}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${hsl(hue+i*22,75,56)}" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="${hsl(hue+i*22,70,42)}" stop-opacity="0"/>
    </linearGradient></defs><line x1="-50" y1="${y1}" x2="${SIZE+50}" y2="${y2}" stroke="url(#${gid})" stroke-width="${w}"/>`;
  }
  return{lightness:14,body};
}

function styleVinylRecord(rng,hue){
  const cx=SIZE/2,cy=SIZE*0.42,R=SIZE*0.4;
  let body=`<rect width="${SIZE}" height="${SIZE}" fill="${hsl(hue,30,14)}"/>`;
  body+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#161616"/>`;
  for(let i=1;i<=6;i++) body+=`<circle cx="${cx}" cy="${cy}" r="${R*(i/7)}" fill="none" stroke="#2c2c2c" stroke-width="1.5"/>`;
  body+=`<circle cx="${cx}" cy="${cy}" r="${R*0.32}" fill="${hsl(hue,65,42+rng()*16)}"/><circle cx="${cx}" cy="${cy}" r="6" fill="#111"/>`;
  return{lightness:20,body};
}

function stylePixelMosaic(rng,hue){
  const cols=8,rows=8,cell=SIZE/cols;
  let body=`<rect width="${SIZE}" height="${SIZE}" fill="${hsl(hue,20,10)}"/>`;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    if(rng()<0.42) continue;
    body+=`<rect x="${c*cell}" y="${r*cell}" width="${cell}" height="${cell}" fill="${hsl(hue+(r*c*7)%120,75,42+rng()*22)}"/>`;
  }
  return{lightness:16,body};
}

function styleSoftBlobs(rng,hue){
  let body=`<rect width="${SIZE}" height="${SIZE}" fill="${hsl(hue,40,55)}"/>`;
  const n=6+Math.floor(rng()*5);
  for(let i=0;i<n;i++){
    const cx=rng()*SIZE,cy=rng()*SIZE*0.78,rx=40+rng()*90,ry=35+rng()*80;
    body+=`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${hsl(hue+i*30,55,50+rng()*25)}" opacity="${(0.28+rng()*0.35).toFixed(2)}"/>`;
  }
  return{lightness:58,body};
}

const STYLE_FNS={gradientRays:styleGradientRays,scatteredShapes:styleScatteredShapes,radialRings:styleRadialRings,triangleMosaic:styleTriangleMosaic,darkStreaks:styleDarkStreaks,vinylRecord:styleVinylRecord,pixelMosaic:stylePixelMosaic,softBlobs:styleSoftBlobs};

function wrapLines(text,max){
  const words=text.split(' ');let lines=[],cur='';
  for(const w of words){const nxt=cur?`${cur} ${w}`:w;if(nxt.length>max&&cur){lines.push(cur);cur=w;}else cur=nxt;}
  if(cur)lines.push(cur);return lines.slice(0,3);
}

function generateCover(seed,index,title,artist,genre){
  const rng=rngFor(seed,index,'cover');
  const hue=Math.floor(rng()*360);
  const candidates=getCoverStyles(genre);
  const fn=STYLE_FNS[pick(rng,candidates)]||styleGradientRays;
  const{body}=fn(rng,hue);
  const scrimH=SIZE*0.44;
  const lines=wrapLines(title.toUpperCase(),16);
  const titleY=SIZE-28-(lines.length-1)*25;
  const tspans=lines.map((l,i)=>`<tspan x="18" dy="${i===0?0:25}">${esc(l)}</tspan>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.7"/></filter>
  </defs>
  ${body}
  <rect x="0" y="${SIZE-scrimH}" width="${SIZE}" height="${scrimH}" fill="url(#scrim)"/>
  <text x="18" y="${titleY}" font-family="Arial,sans-serif" font-weight="800" font-size="23" fill="#fff" filter="url(#sh)">${tspans}</text>
  <text x="18" y="${SIZE-12}" font-family="Arial,sans-serif" font-weight="600" font-size="13" fill="#e8e8e8" filter="url(#sh)">${esc(artist.toUpperCase())}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
module.exports={generateCover};
