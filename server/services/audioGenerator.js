'use strict';

const { rngFor, pick, pickWeighted } = require('./rng');
const { getProfile } = require('./genreProfiles');

const SAMPLE_RATE = 22050;

const ALL_SCALES = [
  { name: 'major',          intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'minor',          intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'dorian',         intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'majorPentatonic',intervals: [0, 2, 4, 7, 9] },
  { name: 'minorPentatonic',intervals: [0, 3, 5, 7, 10] },
];

const PROGRESSIONS = [
  [0, 4, 5, 3],
  [5, 3, 0, 4],
  [0, 3, 4, 4],
  [0, 5, 3, 4],
  [0, 2, 3, 4],
];

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function triadFromScale(scaleIntervals, degree) {
  const len = scaleIntervals.length;
  const notes = [];
  for (const step of [0, 2, 4]) {
    const pos = degree + step;
    notes.push(scaleIntervals[pos % len] + Math.floor(pos / len) * 12);
  }
  return notes;
}

const WAVE_HARMONICS = {
  sine:     [[1, 1.0]],
  triangle: [[1, 1.0], [3, 0.111], [5, 0.04], [7, 0.02]],
  square:   [[1, 1.0], [3, 0.333], [5, 0.2], [7, 0.143], [9, 0.111]],
  sawtooth: [[1, 1.0], [2, 0.5], [3, 0.333], [4, 0.25], [5, 0.2], [6, 0.167], [7, 0.143]],
};

function getHarmonics(waveName, brightness) {
  const base = WAVE_HARMONICS[waveName] || WAVE_HARMONICS.sine;
  if (!brightness || brightness === 1) return base;
  return base.map(([m, a], i) => [m, i === 0 ? a : a * brightness]);
}

function envelopeValue(t, duration, attack, decay, sustain, release) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  if (t < duration) return sustain * (1 - (t - (duration - release)) / release);
  return 0;
}

function addTone(buffer, startSample, durationSamples, freq, amp, harmonics, attack, decay, sustain, release) {
  const duration = durationSamples / SAMPLE_RATE;
  for (let i = 0; i < durationSamples; i++) {
    const idx = startSample + i;
    if (idx < 0 || idx >= buffer.length) continue;
    const t = i / SAMPLE_RATE;
    const env = envelopeValue(t, duration, attack, decay, sustain, release);
    let sample = 0;
    for (const [mult, harmAmp] of harmonics) {
      sample += Math.sin(2 * Math.PI * freq * mult * t) * harmAmp;
    }
    buffer[idx] += sample * env * amp;
  }
}

function addKick(buffer, startSample, amp) {
  const dur = Math.floor(SAMPLE_RATE * 0.18);
  for (let i = 0; i < dur; i++) {
    const idx = startSample + i;
    if (idx < 0 || idx >= buffer.length) continue;
    const t = i / SAMPLE_RATE;
    buffer[idx] += Math.sin(2 * Math.PI * 90 * Math.exp(-18 * t) * t) * Math.exp(-14 * t) * amp;
  }
}

function addSnare(buffer, startSample, amp, rng) {
  const dur = Math.floor(SAMPLE_RATE * 0.1);
  let prev = 0;
  for (let i = 0; i < dur; i++) {
    const idx = startSample + i;
    if (idx < 0 || idx >= buffer.length) continue;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-20 * t);
    prev = prev * 0.6 + (rng() * 2 - 1) * 0.4;
    buffer[idx] += (prev * 0.75 + Math.sin(2 * Math.PI * 200 * t) * 0.3) * env * amp;
  }
}

function addHiHat(buffer, startSample, amp, rng) {
  const dur = Math.floor(SAMPLE_RATE * 0.045);
  let prev = 0;
  for (let i = 0; i < dur; i++) {
    const idx = startSample + i;
    if (idx < 0 || idx >= buffer.length) continue;
    const t = i / dur;
    prev = prev * 0.5 + (rng() * 2 - 1) * 0.5;
    buffer[idx] += prev * Math.pow(1 - t, 4) * amp;
  }
}

function drumsBackbeat(buffer, beat, beatStartSample, secPerBeat, swingOffset, rngSnare, rngHihat) {
  if (beat === 0 || beat === 2) addKick(buffer, beatStartSample, 0.55);
  if (beat === 1 || beat === 3) addSnare(buffer, beatStartSample, 0.32, rngSnare);
  addHiHat(buffer, beatStartSample, 0.13, rngHihat);
  addHiHat(buffer, beatStartSample + Math.floor(swingOffset * SAMPLE_RATE), 0.10, rngHihat);
}

function drumsFourOnFloor(buffer, beat, beatStartSample, secPerBeat, swingOffset, rngSnare, rngHihat) {
  addKick(buffer, beatStartSample, 0.55);              
  if (beat === 1 || beat === 3) addSnare(buffer, beatStartSample, 0.28, rngSnare);
  addHiHat(buffer, beatStartSample, 0.12, rngHihat);
  addHiHat(buffer, beatStartSample + Math.floor(swingOffset * SAMPLE_RATE), 0.09, rngHihat);
}

function drumsSoft(buffer, beat, beatStartSample, secPerBeat, swingOffset, rngSnare, rngHihat) {
  if (beat === 0) addKick(buffer, beatStartSample, 0.30);  
  if (beat === 1 || beat === 3) addSnare(buffer, beatStartSample, 0.15, rngSnare);
  addHiHat(buffer, beatStartSample, 0.07, rngHihat);
  addHiHat(buffer, beatStartSample + Math.floor(swingOffset * SAMPLE_RATE), 0.05, rngHihat);
}

function drumsBrush(buffer, beat, beatStartSample, secPerBeat, swingOffset, rngSnare, rngHihat) {
  if (beat === 0 || beat === 2) addKick(buffer, beatStartSample, 0.28);
  if (beat === 1 || beat === 3) addSnare(buffer, beatStartSample, 0.16, rngSnare);
  addHiHat(buffer, beatStartSample, 0.08, rngHihat);
  addHiHat(buffer, beatStartSample + Math.floor(swingOffset * SAMPLE_RATE), 0.06, rngHihat);
}

function drumsBoomBap(buffer, beat, beatStartSample, secPerBeat, swingOffset, rngSnare, rngHihat) {
  if (beat === 0) addKick(buffer, beatStartSample, 0.65);
  if (beat === 2) addKick(buffer, beatStartSample, 0.50);
  if (beat === 1 || beat === 3) addSnare(buffer, beatStartSample, 0.40, rngSnare);
  addHiHat(buffer, beatStartSample + Math.floor(swingOffset * SAMPLE_RATE), 0.12, rngHihat);
}

function drumsSkank(buffer, beat, beatStartSample, secPerBeat, swingOffset, rngSnare, rngHihat) {
  if (beat === 0) addKick(buffer, beatStartSample, 0.45);
  if (beat === 1 || beat === 3) {
    addHiHat(buffer, beatStartSample, 0.22, rngHihat);
    addSnare(buffer, beatStartSample, 0.14, rngSnare);
  }
  addHiHat(buffer, beatStartSample + Math.floor(swingOffset * SAMPLE_RATE), 0.07, rngHihat);
}

function drumsMetal(buffer, beat, beatStartSample, secPerBeat, swingOffset, rngSnare, rngHihat) {
  addKick(buffer, beatStartSample, 0.60);
  addKick(buffer, beatStartSample + Math.floor(secPerBeat * 0.5 * SAMPLE_RATE), 0.50);
  if (beat === 1 || beat === 3) addSnare(buffer, beatStartSample, 0.45, rngSnare);
  for (let s = 0; s < 4; s++) {
    addHiHat(buffer, beatStartSample + Math.floor(s * secPerBeat * 0.25 * SAMPLE_RATE), 0.10, rngHihat);
  }
}

function drumsRetro(buffer, beat, beatStartSample, secPerBeat, swingOffset, rngSnare, rngHihat) {
  if (beat === 0 || beat === 2) addKick(buffer, beatStartSample, 0.52);
  if (beat === 1 || beat === 3) addSnare(buffer, beatStartSample, 0.35, rngSnare);
}

const DRUM_PATTERNS = {
  backbeat:    drumsBackbeat,
  fourOnFloor: drumsFourOnFloor,
  soft:        drumsSoft,
  brush:       drumsBrush,
  boomBap:     drumsBoomBap,
  skank:       drumsSkank,
  metal:       drumsMetal,
  retro:       drumsRetro,
  none:        () => {},  
};


function getBassNote(rootMidi, scaleIntervals, beat, chordDegreeIdx, bassStyle) {
  const root  = rootMidi - 12 + scaleIntervals[chordDegreeIdx];
  const fifth = rootMidi - 12 + scaleIntervals[(chordDegreeIdx + 4) % scaleIntervals.length];

  switch (bassStyle) {
    case 'walking':
      return root + [0, 2, 4, 7][beat % 4];
    case 'octave':
      return beat % 2 === 0 ? root : root + 12;
    case 'syncopated':
      return beat === 2 ? fifth : root;
    case 'fourOnFloor':
      return root; 
    default: 
      return root;
  }
}

function getBassDuration(secPerBeat, bassStyle) {
  return bassStyle === 'fourOnFloor'
    ? secPerBeat * 0.45   
    : secPerBeat * 0.88;  
}


function applyReverb(buffer, wet) {
  const combDelays = [0.0297, 0.0371, 0.0411, 0.0437].map(s => Math.floor(s * SAMPLE_RATE));
  const combDecay = 0.78;
  const out = new Float32Array(buffer.length);

  for (const delay of combDelays) {
    const combOut = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      combOut[i] = buffer[i] + (i >= delay ? combOut[i - delay] * combDecay : 0);
    }
    for (let i = 0; i < buffer.length; i++) out[i] += combOut[i] * 0.25;
  }

  const apDelay = Math.floor(0.005 * SAMPLE_RATE);
  const apGain = 0.5;
  const diffused = new Float32Array(out.length);
  for (let i = 0; i < out.length; i++) {
    const delayed = i >= apDelay ? out[i - apDelay] : 0;
    const fedBack = i >= apDelay ? diffused[i - apDelay] : 0;
    diffused[i] = -apGain * out[i] + delayed + apGain * fedBack;
  }

  const mixed = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    mixed[i] = buffer[i] * (1 - wet) + diffused[i] * wet;
  }
  return mixed;
}

function applySaturation(buffer, amount) {
  if (!amount || amount <= 0) return buffer;
  const drive = 1 + amount * 5;
  const norm = Math.tanh(drive); 
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = Math.tanh(buffer[i] * drive) / norm;
  }
  return buffer;
}

function normalize(buffer, target = 0.9) {
  let max = 0;
  for (let i = 0; i < buffer.length; i++) max = Math.max(max, Math.abs(buffer[i]));
  if (max === 0) return buffer;
  const scale = target / max;
  for (let i = 0; i < buffer.length; i++) buffer[i] *= scale;
  return buffer;
}

function encodeWav(floatBuffer, sampleRate) {
  const numSamples = floatBuffer.length;
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);          buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);          buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);     buf.writeUInt16LE(1, 20);   
  buf.writeUInt16LE(1, 22);      buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);     buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < numSamples; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, floatBuffer[i])) * 32767), 44 + i * 2);
  }
  return buf;
}


function generateAudio(seed, index, genre) {
  const profile = getProfile(genre);

  const rngScale  = rngFor(seed, index, 'audioScale');
  const rngTempo  = rngFor(seed, index, 'audioTempo');
  const rngRoot   = rngFor(seed, index, 'audioRoot');
  const rngProg   = rngFor(seed, index, 'audioProg');
  const rngMelody = rngFor(seed, index, 'audioMelody');
  const rngRhythm = rngFor(seed, index, 'audioRhythm');
  const rngSnare  = rngFor(seed, index, 'audioSnare');
  const rngHihat  = rngFor(seed, index, 'audioHihat');
  const rngWave   = rngFor(seed, index, 'audioWave');

  const allowedScales = ALL_SCALES.filter(s => profile.scales.includes(s.name));
  const scale = pick(rngScale, allowedScales.length ? allowedScales : ALL_SCALES);

  const [tMin, tMax] = profile.tempoRange;
  const tempo = tMin + Math.floor(rngTempo() * (tMax - tMin + 1));

  const rootMidi = 48 + Math.floor(rngRoot() * 12);  // C3..B3
  const progression = pick(rngProg, PROGRESSIONS);
  const beatsPerBar = 4;
  const bars = profile.bars || 8;

  const leadWaveName = pick(rngWave, profile.leadWaves || ['sine', 'triangle']);
  const leadHarmonics = getHarmonics(leadWaveName, profile.brightness || 1);

  const chordHarmonics = getHarmonics(profile.chordWave || 'sine', (profile.brightness || 1) * 0.9);

  const drumsFn = DRUM_PATTERNS[profile.drums] || DRUM_PATTERNS.backbeat;

  const swing = profile.swing || 0;
  const secPerBeat = 60 / tempo;
  const swingOffset = secPerBeat * (0.5 + swing * 0.22);  
  const totalSeconds = bars * beatsPerBar * secPerBeat + 0.6;
  const buffer = new Float32Array(Math.ceil(totalSeconds * SAMPLE_RATE));

  let melodyDegree = 2;
  let sampleCursor = 0;

  for (let bar = 0; bar < bars; bar++) {
    const chordDegree = progression[bar % progression.length] % scale.intervals.length;

    const barStart = Math.floor(bar * beatsPerBar * secPerBeat * SAMPLE_RATE);
    const barDur   = Math.floor(beatsPerBar * secPerBeat * SAMPLE_RATE);
    for (const interval of triadFromScale(scale.intervals, chordDegree)) {
      addTone(buffer, barStart, barDur,
        midiToFreq(rootMidi + interval), 0.12,
        chordHarmonics, 0.06, 0.18, 0.6, 0.35);
    }

    for (let beat = 0; beat < beatsPerBar; beat++) {
      const beatStart = Math.floor(sampleCursor);

      drumsFn(buffer, beat, beatStart, secPerBeat, swingOffset, rngSnare, rngHihat);

      const bassNote = getBassNote(rootMidi, scale.intervals, beat, chordDegree, profile.bassStyle);
      const bassDur  = Math.floor(getBassDuration(secPerBeat, profile.bassStyle) * SAMPLE_RATE);
      addTone(buffer, beatStart, bassDur,
        midiToFreq(bassNote), 0.22,
        [[1, 1], [2, 0.25]], 0.02, 0.08, 0.85, 0.12);

      const subdivisions = pickWeighted(rngRhythm, [0.55, 0.45]) === 0 ? 1 : 2;
      const noteLen = secPerBeat / subdivisions;

      for (let s = 0; s < subdivisions; s++) {
        const step = pickWeighted(rngMelody, [0.1, 0.25, 0.3, 0.25, 0.1]) - 2;
        melodyDegree = Math.max(0, Math.min(scale.intervals.length * 2 - 1, melodyDegree + step));

        const useChordTone = rngMelody() < 0.35;
        const degree = useChordTone ? chordDegree : melodyDegree % scale.intervals.length;
        const octaveShift = Math.floor(melodyDegree / scale.intervals.length) * 12;
        const midi = rootMidi + scale.intervals[degree] + octaveShift;

        const subOffset = s === 0
          ? Math.floor(s * noteLen * SAMPLE_RATE)
          : Math.floor(swingOffset * SAMPLE_RATE);

        const noteStart  = beatStart + subOffset;
        const noteDur    = Math.floor(noteLen * SAMPLE_RATE * 0.92);

        addTone(buffer, noteStart, noteDur,
          midiToFreq(midi), 0.30,
          leadHarmonics,
          0.008, 0.05, 0.65, Math.min(0.08, noteLen * 0.3));
      }

      sampleCursor += secPerBeat * SAMPLE_RATE;
    }
  }

  const reverbed  = applyReverb(buffer, profile.reverb ?? 0.22);
  const saturated = applySaturation(reverbed, profile.saturation ?? 0);
  const final     = normalize(saturated, 0.88);
  const wav       = encodeWav(final, SAMPLE_RATE);

  return {
    dataUri: `data:audio/wav;base64,${wav.toString('base64')}`,
    durationSeconds: Math.round(totalSeconds * 10) / 10,
    tempo,
    scale: scale.name,
  };
}

module.exports = { generateAudio };
