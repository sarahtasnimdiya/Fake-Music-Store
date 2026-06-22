'use strict';

const IRREGULAR = {
  life: 'lives', knife: 'knives', wife: 'wives', leaf: 'leaves', loaf: 'loaves',
  thief: 'thieves', child: 'children', foot: 'feet', tooth: 'teeth',
  mouse: 'mice', goose: 'geese', man: 'men', woman: 'women', person: 'people',
};

function pluralizeEn(word) {
  const lower = word.toLowerCase();
  if (IRREGULAR[lower]) return matchCase(word, IRREGULAR[lower]);
  if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es';
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  return word + 's';
}

function matchCase(original, replacement) {
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

module.exports = { pluralizeEn };
