'use strict';

const path = require('path');
const fs = require('fs');
const { Faker, en, de,bn_BD, base } = require('@faker-js/faker');
const { seedFor, rngFor, pick, times } = require('./rng');
const { pluralizeEn } = require('./textRules');
const { generateCover } = require('./coverGenerator');

const LOCALES = {};
for (const file of fs.readdirSync(path.join(__dirname, '../locales'))) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales', file)));
  LOCALES[data.code] = data;
}

const FAKER_PACKS = { en, de , bn: bn_BD };
const fakerInstances = {};
function getFaker(localeCode) {
  if (!fakerInstances[localeCode]) {
    const pack = FAKER_PACKS[localeCode] || FAKER_PACKS.en;
    fakerInstances[localeCode] = new Faker({ locale: [pack, base] });
  }
  return fakerInstances[localeCode];
}

function listLocales() {
  return Object.values(LOCALES).map(l => ({ code: l.code, displayName: l.displayName }));
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function fillTemplate(f, template, locale) {
  const wl = locale && locale._wordLists;
  function pw(arr) { return arr[f.number.int({ min: 0, max: arr.length - 1 })]; }
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    switch (key) {

      case 'Adj': return cap(wl ? pw(wl.adjectives) : f.word.adjective());
      case 'adj': return wl ? pw(wl.adjectives) : f.word.adjective();
      case 'Noun': return cap(wl ? pw(wl.nouns) : f.word.noun());
      case 'noun': return wl ? pw(wl.nouns) : f.word.noun();
      case 'Nouns': return wl ? pw(wl.nouns) + 'গুলো' : cap(pluralizeEn(f.word.noun()));
      case 'nouns': return wl ? pw(wl.nouns) + 'গুলো' : pluralizeEn(f.word.noun());
      case 'Verb': return cap(wl ? pw(wl.verbs) :f.word.verb());
      case 'verb': return wl ? pw(wl.verbs) : f.word.verb();
      case 'verbPast': {
        if (wl) return pw(wl.verbs);
         const v = f.word.verb(); return cap(v.endsWith('e') ? v + 'd' : v + 'ed'); 
        }
      case 'verbIng': { 
        if (wl) return pw(wl.verbs) + 'ছি';
        const v = f.word.verb(); return v.endsWith('e') ? v.slice(0, -1) + 'ing' : v + 'ing'; }
      case 'Name': case 'name': {
        if (wl) {
          const names = [...(wl.femaleNames || []), ...(wl.maleNames || [])];
          return names.length ? pw(names) : f.person.firstName();
        }
      return f.person.firstName();
      }
      case 'Number': return String(f.number.int({ min: 2, max: 24 }));
      default: return '';
    }
  });
}

function pickTemplate(f, templates) {
  return templates[f.number.int({ min: 0, max: templates.length - 1 })];
}

function generateTitle(seed, index, locale) {
  const f = getFaker(locale.fakerLocale);
  f.seed(seedFor(seed, index, 'title'));
  return fillTemplate(f, pickTemplate(f, locale.titleTemplates), locale);
}

function generateArtist(seed, index, locale) {
  const f = getFaker(locale.fakerLocale);
  f.seed(seedFor(seed, index, 'artist'));
  const isPerson = f.number.float() < 0.55;
  if (isPerson) return f.person.fullName();
  return fillTemplate(f, pickTemplate(f, locale.bandTemplates), locale);
}

function generateAlbum(seed, index, locale) {
  const f = getFaker(locale.fakerLocale);
  f.seed(seedFor(seed, index, 'album'));
  if (f.number.float() < 0.3) return 'Single';
  return fillTemplate(f, pickTemplate(f, locale.albumTemplates), locale);
}

function generateGenre(seed, index, locale) {
  const rng = rngFor(seed, index, 'genre');
  return pick(rng, locale.genres);
}

function generateLabel(seed, index, locale) {
  const rng = rngFor(seed, index, 'label');
  return pick(rng, locale.labels);
}

function generateYear(seed, index) {
  const rng = rngFor(seed, index, 'year');
  return 1975 + Math.floor(rng() * 50);
}

function generateLikes(seed, index, likesAvg) {
  const rng = rngFor(seed, index, 'likes');
  const addOne = (x) => x + 1;
  return times(likesAvg, addOne, rng)(0);
}

function generateRecord(seed, index, regionCode, likesAvg) {
  const locale = LOCALES[regionCode] || LOCALES.en;
  const title = generateTitle(seed, index, locale);
  const artist = generateArtist(seed, index, locale);
  const album = generateAlbum(seed, index, locale);
  const genre = generateGenre(seed, index, locale);
  const label = generateLabel(seed, index, locale);
  const year = generateYear(seed, index);
  const likes = generateLikes(seed, index, likesAvg);
  const cover = generateCover(seed, index, title, artist, genre);

  return { index, title, artist, album, genre, likes, label, year, cover };
}

function generatePage(seed, regionCode, likesAvg, page, pageSize) {
  const startIndex = (page - 1) * pageSize + 1;
  const items = [];
  for (let i = 0; i < pageSize; i++) {
    items.push(generateRecord(seed, startIndex + i, regionCode, likesAvg));
  }
  return items;
}

module.exports = { listLocales, generateRecord, generatePage, LOCALES };
