'use strict';
require('dotenv').config();
const express=require('express'),cors=require('cors'),path=require('path'),fs=require('fs');
const songsRouter=require('./routes/songs');
const app=express();
const PORT=process.env.PORT||5000;
app.use(cors());app.use(express.json());
app.use('/api',songsRouter);
const dist=path.join(__dirname,'../client/dist');
if(fs.existsSync(dist))
    {app.use(express.static(dist));app.get('*',(req,res)=>res.sendFile(path.join(dist,'index.html')));}
app.listen(PORT,()=>console.log(`Server listening on port ${PORT}`));
