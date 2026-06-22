'use strict';

const DEFAULT_PROFILE = {
  tempoRange: [92, 132], bars: 8, scales: ['major', 'minor'],
  leadWaves: ['sine', 'triangle'], chordWave: 'sine', bassStyle: 'sustained',
  drums: 'backbeat', swing: 0, reverb: 0.22, saturation: 0.08, brightness: 1,
};

const PROFILES = {
  'lo-fi': { tempoRange: [62, 84], bars: 10, scales: ['minorPentatonic', 'dorian', 'minor'],
    leadWaves: ['sine', 'triangle'], chordWave: 'triangle', bassStyle: 'sustained',
    drums: 'soft', swing: 0.22, reverb: 0.38, saturation: 0.03, brightness: 0.6, grain: true },
  'lofi': null, 'chill': null,
  'ambient': { tempoRange: [56, 76], bars: 12, scales: ['majorPentatonic', 'dorian'],
    leadWaves: ['sine'], chordWave: 'sine', bassStyle: 'sustained',
    drums: 'none', swing: 0, reverb: 0.35, saturation: 0, brightness: 0.55 },

  'house': { tempoRange: [118, 126], bars: 8, scales: ['minor', 'dorian'],
    leadWaves: ['sine', 'triangle'], chordWave: 'sine', bassStyle: 'fourOnFloor',
    drums: 'fourOnFloor', swing: 0, reverb: 0.26, saturation: 0.06, brightness: 0.9 },
  'deep house': { tempoRange: [116, 122], bars: 10, scales: ['dorian', 'minor'],
    leadWaves: ['sine'], chordWave: 'sine', bassStyle: 'fourOnFloor',
    drums: 'fourOnFloor', swing: 0.08, reverb: 0.38, saturation: 0.03, brightness: 0.65 },
  'electronic': { tempoRange: [120, 140], bars: 8, scales: ['minor', 'major'],
    leadWaves: ['square', 'sawtooth'], chordWave: 'sawtooth', bassStyle: 'fourOnFloor',
    drums: 'fourOnFloor', swing: 0, reverb: 0.2, saturation: 0.12, brightness: 1.05 },
  'techno': { tempoRange: [128, 148], bars: 8, scales: ['minor'],
    leadWaves: ['square'], chordWave: 'sawtooth', bassStyle: 'fourOnFloor',
    drums: 'fourOnFloor', swing: 0, reverb: 0.15, saturation: 0.15, brightness: 1.1 },
  'disco': { tempoRange: [112, 124], bars: 8, scales: ['major', 'dorian'],
    leadWaves: ['sawtooth', 'triangle'], chordWave: 'sawtooth', bassStyle: 'octave',
    drums: 'fourOnFloor', swing: 0.05, reverb: 0.24, saturation: 0.08, brightness: 0.95 },

  'retro': { tempoRange: [120, 158], bars: 8, scales: ['majorPentatonic', 'minorPentatonic', 'major'],
    leadWaves: ['square'], chordWave: 'square', bassStyle: 'syncopated',
    drums: 'retro', swing: 0, reverb: 0.08, saturation: 0.1, brightness: 1.05, chiptune: true },
  'synthwave': { tempoRange: [96, 118], bars: 8, scales: ['minor', 'dorian'],
    leadWaves: ['sawtooth', 'square'], chordWave: 'sawtooth', bassStyle: 'syncopated',
    drums: 'retro', swing: 0, reverb: 0.32, saturation: 0.1, brightness: 0.95 },
  '8-bit': null,

  'rock': { tempoRange: [108, 148], bars: 8, scales: ['minor', 'major'],
    leadWaves: ['sawtooth'], chordWave: 'sawtooth', bassStyle: 'walking',
    drums: 'backbeat', swing: 0, reverb: 0.16, saturation: 0.16, brightness: 0.95 },
  "rock'n'roll": { tempoRange: [128, 168], bars: 8, scales: ['major', 'minorPentatonic'],
    leadWaves: ['sawtooth', 'triangle'], chordWave: 'triangle', bassStyle: 'walking',
    drums: 'backbeat', swing: 0.1, reverb: 0.15, saturation: 0.14, brightness: 0.95 },
  'heavy metal': { tempoRange: [140, 180], bars: 8, scales: ['minor'],
    leadWaves: ['sawtooth', 'square'], chordWave: 'sawtooth', bassStyle: 'walking',
    drums: 'metal', swing: 0, reverb: 0.12, saturation: 0.22, brightness: 1.05 },
  'punk': { tempoRange: [160, 200], bars: 6, scales: ['minor', 'major'],
    leadWaves: ['sawtooth'], chordWave: 'sawtooth', bassStyle: 'walking',
    drums: 'metal', swing: 0, reverb: 0.1, saturation: 0.2, brightness: 1 },
  'folk': { tempoRange: [88, 116], bars: 8, scales: ['major', 'dorian'],
    leadWaves: ['triangle', 'sine'], chordWave: 'triangle', bassStyle: 'sustained',
    drums: 'brush', swing: 0.12, reverb: 0.22, saturation: 0.03, brightness: 0.8 },
  'country': { tempoRange: [96, 132], bars: 8, scales: ['major'],
    leadWaves: ['triangle', 'sawtooth'], chordWave: 'triangle', bassStyle: 'walking',
    drums: 'backbeat', swing: 0.08, reverb: 0.18, saturation: 0.06, brightness: 0.9 },
  'classic': { tempoRange: [72, 104], bars: 12, scales: ['major', 'minor', 'dorian'],
    leadWaves: ['sine', 'triangle'], chordWave: 'sine', bassStyle: 'sustained',
    drums: 'none', swing: 0, reverb: 0.38, saturation: 0, brightness: 0.75 },

  'soul': { tempoRange: [80, 108], bars: 8, scales: ['minorPentatonic', 'dorian'],
    leadWaves: ['triangle', 'sine'], chordWave: 'sine', bassStyle: 'walking',
    drums: 'backbeat', swing: 0.18, reverb: 0.28, saturation: 0.06, brightness: 0.85 },
  'jazz': { tempoRange: [84, 132], bars: 8, scales: ['dorian', 'minor'],
    leadWaves: ['sine', 'triangle'], chordWave: 'sine', bassStyle: 'walking',
    drums: 'brush', swing: 0.3, reverb: 0.28, saturation: 0.03, brightness: 0.82 },
  'blues': { tempoRange: [70, 104], bars: 8, scales: ['minorPentatonic'],
    leadWaves: ['triangle', 'sawtooth'], chordWave: 'triangle', bassStyle: 'walking',
    drums: 'brush', swing: 0.28, reverb: 0.24, saturation: 0.1, brightness: 0.85 },
  'hip-hop': { tempoRange: [78, 98], bars: 8, scales: ['minorPentatonic', 'dorian'],
    leadWaves: ['sine', 'triangle'], chordWave: 'sine', bassStyle: 'syncopated',
    drums: 'boomBap', swing: 0.15, reverb: 0.2, saturation: 0.08, brightness: 0.82 },
  'reggae': { tempoRange: [76, 96], bars: 8, scales: ['major', 'dorian'],
    leadWaves: ['triangle'], chordWave: 'triangle', bassStyle: 'syncopated',
    drums: 'skank', swing: 0.05, reverb: 0.3, saturation: 0.04, brightness: 0.82 },

  'pop': { tempoRange: [98, 128], bars: 8, scales: ['major', 'major'],
    leadWaves: ['triangle', 'sawtooth'], chordWave: 'sine', bassStyle: 'sustained',
    drums: 'backbeat', swing: 0, reverb: 0.24, saturation: 0.08, brightness: 0.95 },

  'schlager': null, 'volksmusik': null, 'elektro': null, 'indie': null, 'metal': null,
};

PROFILES['lofi'] = PROFILES['lo-fi'];
PROFILES['chill'] = PROFILES['lo-fi'];
PROFILES['8-bit'] = PROFILES['retro'];
PROFILES['schlager'] = PROFILES['pop'];
PROFILES['volksmusik'] = PROFILES['folk'];
PROFILES['elektro'] = PROFILES['electronic'];
PROFILES['indie'] = PROFILES['rock'];
PROFILES['metal'] = PROFILES['heavy metal'];

const COVER_STYLES = {
  default: ['gradientRays', 'scatteredShapes', 'radialRings', 'triangleMosaic'],
  chill: ['radialRings', 'gradientRays', 'softBlobs'],
  electronic: ['scatteredShapes', 'darkStreaks', 'triangleMosaic'],
  retro: ['pixelMosaic', 'darkStreaks', 'scatteredShapes'],
  classic: ['vinylRecord', 'radialRings'],
  band: ['darkStreaks', 'triangleMosaic', 'scatteredShapes'],
  groove: ['vinylRecord', 'gradientRays', 'radialRings'],
  pop: ['gradientRays', 'scatteredShapes', 'triangleMosaic'],
};

function coverFamilyFor(genreKey) {
  if (['lo-fi', 'lofi', 'chill', 'ambient'].includes(genreKey)) return 'chill';
  if (['house', 'deep house', 'electronic', 'techno', 'disco'].includes(genreKey)) return 'electronic';
  if (['retro', 'synthwave', '8-bit'].includes(genreKey)) return 'retro';
  if (['classic', 'folk'].includes(genreKey)) return 'classic';
  if (['rock', "rock'n'roll", 'heavy metal', 'punk', 'country', 'metal', 'indie'].includes(genreKey)) return 'band';
  if (['soul', 'jazz', 'blues', 'hip-hop', 'reggae'].includes(genreKey)) return 'groove';
  return 'pop';
}

function getProfile(genre) {
  const key = (genre || '').toLowerCase().trim();
  return PROFILES[key] || DEFAULT_PROFILE;
}
function getCoverStyles(genre) {
  const key = (genre || '').toLowerCase().trim();
  return COVER_STYLES[coverFamilyFor(key)] || COVER_STYLES.default;
}

module.exports = { getProfile, getCoverStyles, DEFAULT_PROFILE };
