import {useEffect,useRef,useState} from 'react';

export default function SongDetail({record,detail,loading}){
  const[tab,setTab]=useState('lyrics');
  const[currentTime,setCurrentTime]=useState(0);
  const audioRef=useRef(null);

  useEffect(()=>{
    const el=audioRef.current;
    if(!el) return;
    const handler=()=>setCurrentTime(el.currentTime);
    el.addEventListener('timeupdate',handler);
    return()=>el.removeEventListener('timeupdate',handler);
  },[detail]);

  const activeRef=useRef(null);
  useEffect(()=>{if(activeRef.current) activeRef.current.scrollIntoView({block:'nearest',behavior:'smooth'});},[currentTime]);

  if(loading) return(
    <div className="d-flex align-items-center gap-2 text-muted py-4 px-3">
      <span className="spinner-border spinner-border-sm"/>Generating audio…
    </div>
  );
  if(!detail) return null;

  function activeIndex(){
    if(!detail.lyrics||!detail.lyrics.length) return -1;
    let last=0;
    for(let i=0;i<detail.lyrics.length;i++){if(currentTime>=detail.lyrics[i].time) last=i;}
    return currentTime>0?last:-1;
  }
  const ai=activeIndex();

  return(
    <div className="d-flex flex-column flex-md-row gap-3 p-3">
      <div className="text-center">
        <img src={record.cover} alt={record.title} className="cover-large"/>
        {record.likes>0&&<div className="mt-2"><span className="badge bg-primary fs-6"><i className="bi bi-hand-thumbs-up-fill me-1"/>{record.likes}</span></div>}
      </div>
      <div className="flex-grow-1 min-width-0">
        <h4 className="mb-1">{record.title}</h4>
        <audio ref={audioRef} controls src={detail.audio} style={{width:'100%',maxWidth:420}} className="mb-2"/>
        <div className="text-muted mb-1">from <strong>{record.album}</strong> by <em>{record.artist}</em></div>
        <div className="text-muted small mb-3">{record.label}, {record.year} · {record.genre}</div>
        <ul className="nav nav-tabs mb-2">
          <li className="nav-item"><button className={`nav-link ${tab==='lyrics'?'active':''}`} onClick={()=>setTab('lyrics')}>Lyrics</button></li>
          <li className="nav-item"><button className={`nav-link ${tab==='review'?'active':''}`} onClick={()=>setTab('review')}>Review</button></li>
        </ul>
        {tab==='lyrics'&&(
          <div className="lyrics-box">
            {detail.lyrics.map((line,i)=>(
              <p key={i} ref={i===ai?activeRef:null} className={`lyric-line ${i===ai?'active':''}`}>{line.text}</p>
            ))}
          </div>
        )}
        {tab==='review'&&<p className="fst-italic text-secondary">{detail.review}</p>}
      </div>
    </div>
  );
}
