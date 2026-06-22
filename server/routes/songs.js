'use strict';
const express=require('express');
const {listLocales,generateRecord,generatePage}=require('../services/dataGenerator');
const {generateAudio}=require('../services/audioGenerator');
const {generateLyrics,generateReview}=require('../services/textGenerator');
const router=express.Router();

function parseParams(req){
  return{
    seed:Number(req.query.seed)||0,
    region:req.query.region||'en',
    likesAvg:Math.max(0,Math.min(10,Number(req.query.likes)||0)),
    page:Math.max(1,Number(req.query.page)||1),
    pageSize:Math.max(1,Math.min(50,Number(req.query.pageSize)||12)),
  };
}

router.get('/locales',(req,res)=>res.json(listLocales()));

router.get('/songs',(req,res)=>{
  const{seed,region,likesAvg,page,pageSize}=parseParams(req);
  res.json({page,pageSize,items:generatePage(seed,region,likesAvg,page,pageSize)});
});

router.get('/songs/:index/detail',(req,res)=>{
  const index=Number(req.params.index);
  const{seed,region,likesAvg}=parseParams(req);
  if(!Number.isInteger(index)||index<1) return res.status(400).json({message:'Invalid index.'});
  const record=generateRecord(seed,index,region,likesAvg);
  const audio=generateAudio(seed,index,record.genre);
  const lyrics=generateLyrics(seed,index,region,audio.durationSeconds);
  const review=generateReview(seed,index,region,record);
  res.json({...record,audio:audio.dataUri,durationSeconds:audio.durationSeconds,lyrics,review});
});

module.exports=router;
