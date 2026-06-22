function rndSeed(){return Math.floor(Math.random()*Number.MAX_SAFE_INTEGER);}
export default function Toolbar({locales,region,setRegion,seedInput,setSeedInput,likes,setLikes,viewMode,setViewMode}){
  return(
    <div className="toolbar-card d-flex flex-wrap align-items-center gap-3 p-3 mb-3">
      <div>
        <label className="form-label small text-muted mb-1">Language</label>
        <select className="form-select form-select-sm" style={{minWidth:165}} value={region} onChange={e=>setRegion(e.target.value)}>
          {locales.map(l=><option key={l.code} value={l.code}>{l.displayName}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label small text-muted mb-1">Seed</label>
        <div className="input-group input-group-sm" style={{width:210}}>
          <input type="text" inputMode="numeric" className="form-control" value={seedInput} onChange={e=>setSeedInput(e.target.value.replace(/[^0-9]/g,''))}/>
          <button className="btn btn-outline-secondary" onClick={()=>setSeedInput(String(rndSeed()))} title="Random seed"><i className="bi bi-shuffle"/></button>
        </div>
      </div>
      <div style={{minWidth:220}}>
        <label className="form-label small text-muted mb-1">Likes: {likes.toFixed(1)}</label>
        <input type="range" className="form-range" min={0} max={10} step={0.1} value={likes} onChange={e=>setLikes(Number(e.target.value))}/>
      </div>
      <div className="ms-auto btn-group">
        <button className={`btn btn-sm ${viewMode==='table'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setViewMode('table')} title="Table view"><i className="bi bi-table"/></button>
        <button className={`btn btn-sm ${viewMode==='gallery'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setViewMode('gallery')} title="Gallery view"><i className="bi bi-grid-3x3-gap-fill"/></button>
      </div>
    </div>
  );
}
