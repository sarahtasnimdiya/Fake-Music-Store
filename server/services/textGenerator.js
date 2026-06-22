'use strict';
const path=require('path'),fs=require('fs');
const {Faker,en,de,base}=require('@faker-js/faker');
const {seedFor}=require('./rng');
const {pluralizeEn}=require('./textRules');
const LOCALES={};
for(const f of fs.readdirSync(path.join(__dirname,'../locales'))){const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../locales',f)));LOCALES[d.code]=d;}
const FAKER_PACKS={en,de};
const FI={};
function getFaker(c){if(!FI[c]){const p=FAKER_PACKS[c]||FAKER_PACKS.en;FI[c]=new Faker({locale:[p,base]});}return FI[c];}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
function fill(f,t,ctx){
  return t.replace(/\{(\w+)\}/g,(_,k)=>{
    switch(k){
      case 'Adj':return cap(f.word.adjective());case 'adj':return f.word.adjective();
      case 'Noun':return cap(f.word.noun());case 'noun':return f.word.noun();
      case 'Nouns':return cap(pluralizeEn(f.word.noun()));case 'nouns':return pluralizeEn(f.word.noun());
      case 'Verb':return cap(f.word.verb());case 'verb':return f.word.verb();
      case 'verbIng':{const v=f.word.verb();return v.endsWith('e')?v.slice(0,-1)+'ing':v+'ing';}
      case 'Name':case 'name':return f.person.firstName();
      case 'title':return ctx.title||'';case 'artist':return ctx.artist||'';case 'genre':return ctx.genre||'';
      default:return '';
    }
  });
}
function generateLyrics(seed,index,regionCode,durationSeconds){
  const locale=LOCALES[regionCode]||LOCALES.en;
  const f=getFaker(locale.fakerLocale);
  f.seed(seedFor(seed,index,'lyrics'));
  const lineCount=6+f.number.int({min:0,max:4});
  const lines=[];
  for(let i=0;i<lineCount;i++){
    const t=locale.lyricTemplates[f.number.int({min:0,max:locale.lyricTemplates.length-1})];
    lines.push(fill(f,t,{}));
  }
  const step=durationSeconds/(lineCount+1);
  return lines.map((text,i)=>({time:Math.round(step*(i+1)*10)/10,text}));
}
function generateReview(seed,index,regionCode,record){
  const locale=LOCALES[regionCode]||LOCALES.en;
  const f=getFaker(locale.fakerLocale);
  f.seed(seedFor(seed,index,'review'));
  const t=locale.reviewTemplates[f.number.int({min:0,max:locale.reviewTemplates.length-1})];
  return fill(f,t,{title:record.title,artist:record.artist,genre:record.genre});
}
module.exports={generateLyrics,generateReview};
