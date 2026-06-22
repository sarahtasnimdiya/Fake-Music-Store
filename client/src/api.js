const BASE='/api';
async function get(url){const r=await fetch(url);if(!r.ok)throw new Error(`${r.status}`);return r.json();}
export default{
  getLocales:()=>get(`${BASE}/locales`),
  getSongs:({seed,region,likes,page,pageSize})=>get(`${BASE}/songs?seed=${seed}&region=${region}&likes=${likes}&page=${page}&pageSize=${pageSize}`),
  getSongDetail:(index,{seed,region,likes})=>get(`${BASE}/songs/${index}/detail?seed=${seed}&region=${region}&likes=${likes}`),
};
