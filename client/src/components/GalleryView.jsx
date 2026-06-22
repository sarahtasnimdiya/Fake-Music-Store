import {useCallback,useEffect,useRef,useState} from 'react';
import api from '../api';
import SongDetail from './SongDetail';
const PAGE_SIZE=16;
export default function GalleryView({seed,region,likes}){
  const[items,setItems]=useState([]);
  const[page,setPage]=useState(0);
  const[loading,setLoading]=useState(false);
  const[active,setActive]=useState(null);
  const[detail,setDetail]=useState(null);
  const[detailLoading,setDetailLoading]=useState(false);
  const sentinelRef=useRef(null);
  useEffect(()=>{setItems([]);setPage(0);window.scrollTo({top:0});},[seed,region,likes]);
  const loadNext=useCallback(()=>{
    setLoading(true);
    const next=page+1;
    api.getSongs({seed,region,likes,page:next,pageSize:PAGE_SIZE}).then(d=>{
      setItems(prev=>[...prev,...d.items]);setPage(next);setLoading(false);
    });
  },[seed,region,likes,page]);
  useEffect(()=>{if(page===0)loadNext();},[page===0,seed,region,likes]);
  useEffect(()=>{
    const el=sentinelRef.current;if(!el)return;
    const obs=new IntersectionObserver(e=>{if(e[0].isIntersecting&&!loading)loadNext();},{rootMargin:'300px'});
    obs.observe(el);return()=>obs.disconnect();
  },[loadNext,loading]);
  function openCard(record){
    setActive(record);setDetail(null);setDetailLoading(true);
    api.getSongDetail(record.index,{seed,region,likes}).then(d=>{setDetail(d);setDetailLoading(false);});
  }
  return(
    <div>
      <div className="row g-3">
        {items.map(record=>(
          <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={record.index}>
            <div className="gallery-card" onClick={()=>openCard(record)}>
              <img src={record.cover} alt={record.title}/>
              <div className="p-2">
                <div className="small text-muted">#{record.index}</div>
                <div className="fw-semibold text-truncate">{record.title}</div>
                <div className="small text-truncate text-muted">{record.artist}</div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span className="badge text-bg-light">{record.genre}</span>
                  {record.likes>0&&<span className="small text-primary"><i className="bi bi-hand-thumbs-up-fill me-1"/>{record.likes}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="text-center py-4">{loading&&<span className="spinner-border spinner-border-sm text-secondary"/>}</div>
      {active&&(
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{background:'rgba(0,0,0,.5)',zIndex:1050}} onClick={()=>setActive(null)}>
          <div className="bg-white rounded shadow-lg" style={{maxWidth:620,width:'100%',maxHeight:'88vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div className="d-flex justify-content-end p-2"><button className="btn-close" onClick={()=>setActive(null)}/></div>
            <SongDetail record={active} detail={detail} loading={detailLoading}/>
          </div>
        </div>
      )}
    </div>
  );
}
