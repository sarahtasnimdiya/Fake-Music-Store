'use strict';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function combineSeed(seed, n) {
  const s = Number(seed) >>> 0;
  return ((s * 2654435761) ^ (n * 40503) + n) >>> 0;
}

function seedFor(seed, index, salt) {
  const base = combineSeed(seed, index);
  return (base ^ hashString(salt)) >>> 0;
}

function rngFor(seed, index, salt) {
  return mulberry32(seedFor(seed, index, salt));
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function pickWeighted(rng, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function times(n, fn, rng) {
  if (n < 0) throw new Error('The first argument cannot be negative.');
  return (arg) => {
    for (let i = Math.floor(n); i--; ) arg = fn(arg);
    return rng() < n % 1 ? fn(arg) : arg;
  };
}

module.exports = { mulberry32, hashString, combineSeed, seedFor, rngFor, pick, pickWeighted, times };
