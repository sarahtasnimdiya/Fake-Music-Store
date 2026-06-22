import {useEffect,useState} from 'react';
export default function useDebouncedValue(value,delayMs=350){
  const[d,setD]=useState(value);
  useEffect(()=>{const t=setTimeout(()=>setD(value),delayMs);return()=>clearTimeout(t);},[value,delayMs]);
  return d;
}
