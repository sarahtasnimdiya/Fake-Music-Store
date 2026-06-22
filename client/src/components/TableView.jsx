import {Fragment,useEffect,useState} from 'react';
import api from '../api';
import SongDetail from './SongDetail';
const PAGE_SIZE=12;
export default function TableView({seed,region,likes}){
  const[page,setPage]=useState(1);
  const[items,setItems]=useState([]);
  const[loading,setLoading]=useState(true);
  const[expanded,setExpanded]=useState(null);
  const[detail,setDetail]=useState(null);
  const[detailLoading,setDetailLoading]=useState(false);
  useEffect(()=>{setPage(1);setExpanded(null);},[seed,region,likes]);
  useEffect(()=>{
    let cancelled=false;
    setLoading(true);
    api.getSongs({seed,region,likes,page,pageSize:PAGE_SIZE}).then(d=>{if(!cancelled){setItems(d.items);setLoading(false);}});
    return()=>{cancelled=true;};
  },[seed,region,likes,page]);
  function toggleRow(record){
    if(expanded===record.index){setExpanded(null);return;}
    setExpanded(record.index);setDetail(null);setDetailLoading(true);
    api.getSongDetail(record.index,{seed,region,likes}).then(d=>{setDetail(d);setDetailLoading(false);});
  }
  return(
    <div className="bg-white rounded shadow-sm">
      <table className="table table-hover mb-0" style={{fontSize:14}}>
        <thead><tr style={{borderBottom:'2px solid #dee2e6'}}>
          <th style={{width:36}}/>
          <th>#</th><th>Song</th><th>Artist</th><th>Album</th><th>Genre</th><th>Likes</th>
        </tr></thead>
        <tbody>
          {loading?<tr><td colSpan={7} className="text-center py-5"><span className="spinner-border spinner-border-sm"/></td></tr>
          :items.map(record=>(
            <Fragment key={record.index}>
              <tr className={`song-row ${expanded===record.index?'expanded':''}`} onClick={()=>toggleRow(record)}>
                <td><i className={`bi ${expanded===record.index?'bi-chevron-up':'bi-chevron-down'} text-muted`}/></td>
                <td>{record.index}</td>
                <td>{record.title}</td>
                <td>{record.artist}</td>
                <td className={record.album==='Single'?'text-muted':''}>{record.album}</td>
                <td>{record.genre}</td>
                <td>{record.likes>0?<span className="badge bg-primary"><i className="bi bi-hand-thumbs-up-fill me-1"/>{record.likes}</span>:<span className="text-muted">0</span>}</td>
              </tr>
              {expanded===record.index&&(
                <tr><td colSpan={7} className="p-0 border-top-0">
                  <SongDetail record={record} detail={detail} loading={detailLoading}/>
                </td></tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-center align-items-center gap-2 py-3">
        <button className="btn btn-sm btn-outline-secondary" disabled={page===1} onClick={()=>setPage(1)}><i className="bi bi-chevron-bar-left"/></button>
        <button className="btn btn-sm btn-outline-secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}><i className="bi bi-chevron-left"/></button>
        <span className="px-3">Page {page}</span>
        <button className="btn btn-sm btn-outline-secondary" onClick={()=>setPage(p=>p+1)}><i className="bi bi-chevron-right"/></button>
      </div>
    </div>
  );
}
