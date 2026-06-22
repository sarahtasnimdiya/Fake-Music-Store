import {useEffect,useState} from 'react';
import api from './api';
import Toolbar from './components/Toolbar';
import TableView from './components/TableView';
import GalleryView from './components/GalleryView';
import useDebouncedValue from './hooks/useDebouncedValue';

export default function App(){
  const[locales,setLocales]=useState([{code:'en',displayName:'English (US)'}]);
  const[region,setRegion]=useState('en');
  const[seedInput,setSeedInput]=useState(String(Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)));
  const seed=useDebouncedValue(seedInput,350);
  const[likes,setLikes]=useState(3);
  const[viewMode,setViewMode]=useState('table');
  const[exporting,setExporting]=useState(false);

  useEffect(()=>{api.getLocales().then(setLocales).catch(()=>{});},[]);

  async function handleExport(){
    setExporting(true);
    try{
      const JSZip=(await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
      const zip=new JSZip();
      const count=10;
      for(let i=1;i<=count;i++){
        const d=await api.getSongDetail(i,{seed,region,likes});
        const base64=d.audio.split(',')[1];
        const name=`${i}. ${d.title} - ${d.artist}.wav`.replace(/[\\/:*?"<>|]/g,'_');
        zip.file(name,base64,{base64:true});
      }
      const blob=await zip.generateAsync({type:'blob'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='music_export.zip';
      a.click();
    }catch(e){alert('Export failed: '+e.message);}
    finally{setExporting(false);}
  }

  return(
    <div className="container-fluid px-3 px-md-4 py-3" style={{maxWidth:1400,margin:'0 auto'}}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0"><i className="bi bi-music-note-beamed me-2"/>Fake Music Store</h4>
        <button className="btn btn-sm btn-outline-secondary" onClick={handleExport} disabled={exporting}>
          {exporting?<><span className="spinner-border spinner-border-sm me-1"/>Exporting…</>:<><i className="bi bi-download me-1"/>Export ZIP</>}
        </button>
      </div>
      <Toolbar locales={locales} region={region} setRegion={setRegion}
        seedInput={seedInput} setSeedInput={setSeedInput}
        likes={likes} setLikes={setLikes}
        viewMode={viewMode} setViewMode={setViewMode}/>
      {viewMode==='table'
        ?<TableView seed={seed} region={region} likes={likes}/>
        :<GalleryView seed={seed} region={region} likes={likes}/>}
    </div>
  );
}
