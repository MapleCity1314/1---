const TXT={title:'\u95f2\u9c7c\u4e00\u5143\u5c0f\u5e97',sub:'\u5546\u54c1\u53f0\u8d26',loading:'\u6570\u636e\u89e3\u5bc6\u4e2d...',bad:'\u89e3\u5bc6\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u94fe\u63a5\u91cc\u7684 key\u3002',all:'\u5168\u90e8',search:'\u641c\u7d22\u6807\u9898 / \u7f16\u53f7 / \u5907\u6ce8',category:'\u5206\u7c7b',status:'\u72b6\u6001',inventory:'\u5546\u54c1\u53f0\u8d26',source:'\u6e90\u6587\u4ef6',generated:'\u751f\u6210\u65f6\u95f4',count:'\u5546\u54c1\u6570',stock:'\u603b\u5e93\u5b58',cost:'\u603b\u6210\u672c',revenue:'\u9884\u4f30\u552e\u4ef7',showing:'\u663e\u793a',rows:'\u6761',clear:'\u6e05\u9664',noData:'\u6ca1\u6709\u6570\u636e'};
const state={data:null,tab:'inventory',sortKey:null,sortDir:1};

function keyFromHash(){
  const hash=location.hash.replace(/^#/,'');
  if(!hash)return '';
  const params=new URLSearchParams(hash);
  return params.get('key')||hash;
}

function b64url(text){
  text=text.replace(/-/g,'+').replace(/_/g,'/');
  while(text.length%4)text+='=';
  return Uint8Array.from(atob(text),c=>c.charCodeAt(0));
}

async function decrypt(keyText){
  const meta=await fetch('data.enc.json',{cache:'no-store'}).then(r=>r.json());
  const key=await crypto.subtle.importKey('raw',b64url(keyText),{name:'AES-GCM'},false,['decrypt']);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64url(meta.nonce)},key,b64url(meta.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}

function esc(v){
  return String(v??'').replace(/[&<>']/g,m=>m==='&'?'&amp;':m==='<'?'&lt;':m==='>'?'&gt;':'&#39;');
}
function money(n){return typeof n==='number'?'\u00a5'+n.toFixed(2):esc(n);}
function pct(n){return typeof n==='number'?(n*100).toFixed(1)+'%':esc(n);}
function numeric(v){return typeof v==='number'&&!Number.isNaN(v);}

function layout(){
  document.getElementById('app').innerHTML=`<header class='top'><div class='inner'><h1>${TXT.title} <span style='font-size:14px;color:#667085;font-weight:500'>${TXT.sub}</span></h1><div class='sub' id='meta'></div><div class='metrics' id='metrics'></div><div class='toolbar'><select id='cat'></select><select id='sts'></select><input id='q' autocomplete='off' placeholder='${TXT.search}'><button class='clear' id='clear'>${TXT.clear}</button><span class='sub' id='shown' style='margin-left:auto'></span></div></div></header><main class='inner'><div class='tabs' id='tabs'></div><div class='tableWrap'><table><thead id='thead'></thead><tbody id='tbody'></tbody></table></div><div class='foot'>AES-256-GCM · key only in URL fragment · ${TXT.source}: <span id='src'></span></div></main>`;
}

function initFilters(items){
  const cat=document.getElementById('cat'),sts=document.getElementById('sts');
  const cats=[...new Set(items.map(x=>x.category).filter(Boolean))].sort();
  const ss=[...new Set(items.map(x=>x.status).filter(Boolean))].sort();
  cat.innerHTML=`<option value=''>${TXT.category}: ${TXT.all}</option>`+cats.map(x=>`<option>${esc(x)}</option>`).join('');
  sts.innerHTML=`<option value=''>${TXT.status}: ${TXT.all}</option>`+ss.map(x=>`<option>${esc(x)}</option>`).join('');
  [cat,sts,document.getElementById('q')].forEach(x=>x.addEventListener(x.tagName==='INPUT'?'input':'change',render));
  document.getElementById('clear').onclick=()=>{cat.value='';sts.value='';document.getElementById('q').value='';render();};
}

function metrics(items){
  const stock=items.reduce((s,r)=>s+(Number(r.stock)||0),0);
  const cost=items.reduce((s,r)=>s+(Number(r.cost)||0)*(Number(r.stock)||0),0);
  const rev=items.reduce((s,r)=>s+(Number(r.price)||0)*(Number(r.stock)||0),0);
  document.getElementById('metrics').innerHTML=[[items.length,TXT.count],[stock,TXT.stock],[money(cost),TXT.cost],[money(rev),TXT.revenue]].map(x=>`<div class='metric'><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
}

function tabs(){
  const t=[{id:'inventory',name:TXT.inventory},...state.data.sheets.map((s,i)=>({id:'sheet'+i,name:s.name}))];
  document.getElementById('tabs').innerHTML=t.map(x=>`<button data-tab='${x.id}' class='${state.tab===x.id?'active':''}'>${esc(x.name)}</button>`).join('');
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;state.sortKey=null;render();});
}

function cmp(a,b){
  if(numeric(a)&&numeric(b))return a-b;
  return String(a??'').localeCompare(String(b??''),'zh-Hans-CN');
}

function filteredInventory(){
  const cat=document.getElementById('cat').value,sts=document.getElementById('sts').value,q=document.getElementById('q').value.trim().toLowerCase();
  let rows=state.data.inventory.filter(r=>(!cat||r.category===cat)&&(!sts||r.status===sts));
  if(q)rows=rows.filter(r=>[r.id,r.title,r.category,r.condition,r.description,r.notes].filter(Boolean).join(' ').toLowerCase().includes(q));
  if(state.sortKey)rows=[...rows].sort((a,b)=>cmp(a[state.sortKey],b[state.sortKey])*state.sortDir);
  return rows;
}

function cell(key,v){
  if(key==='profit')return `<td class='num ${v>0?'pos':v<0?'neg':''}'>${money(v)}</td>`;
  if(key==='profitRate')return `<td class='num'>${pct(v)}</td>`;
  if(['cost','price'].includes(key))return `<td class='num'>${money(v)}</td>`;
  if(numeric(v))return `<td class='num'>${esc(v)}</td>`;
  if(key==='status')return `<td><span class='pill'>${esc(v)}</span></td>`;
  if((key==='imageUrl'||key==='xianyuUrl')&&v)return `<td><a class='link' target='_blank' rel='noopener' href='${esc(v)}'>${esc(v)}</a></td>`;
  return `<td>${esc(v)}</td>`;
}

function renderInventory(){
  const cols=state.data.inventoryColumns,rows=filteredInventory();
  document.getElementById('shown').textContent=`${TXT.showing} ${rows.length} / ${state.data.inventory.length} ${TXT.rows}`;
  document.getElementById('thead').innerHTML='<tr>'+cols.map(c=>`<th data-sort='${c.key}'>${esc(c.label)}</th>`).join('')+'</tr>';
  document.getElementById('tbody').innerHTML=rows.length?rows.map(r=>'<tr>'+cols.map(c=>cell(c.key,r[c.key])).join('')+'</tr>').join(''):`<tr><td class='empty' colspan='${cols.length}'>${TXT.noData}</td></tr>`;
  document.querySelectorAll('[data-sort]').forEach(th=>th.onclick=()=>{const k=th.dataset.sort;state.sortDir=state.sortKey===k?-state.sortDir:1;state.sortKey=k;render();});
}

function renderSheet(idx){
  const rows=state.data.sheets[idx].rows||[];
  const max=Math.max(1,...rows.map(r=>r.length));
  document.getElementById('shown').textContent=`${rows.length} ${TXT.rows}`;
  document.getElementById('thead').innerHTML='';
  document.getElementById('tbody').innerHTML=rows.length?rows.map((r,i)=>'<tr>'+Array.from({length:max},(_,c)=>i===0?`<th>${esc(r[c])}</th>`:`<td>${esc(r[c])}</td>`).join('')+'</tr>').join(''):`<tr><td class='empty'>${TXT.noData}</td></tr>`;
}

function render(){
  tabs();
  metrics(state.data.inventory);
  document.getElementById('meta').textContent=`${TXT.generated}: ${state.data.generatedAt}`;
  document.getElementById('src').textContent=state.data.sourceWorkbook;
  if(state.tab==='inventory')renderInventory();
  else renderSheet(Number(state.tab.replace('sheet','')));
}

async function boot(){
  const key=keyFromHash();
  if(!key)return;
  document.getElementById('app').innerHTML=`<div class='status'>${TXT.loading}</div>`;
  try{
    state.data=await decrypt(key);
    layout();
    initFilters(state.data.inventory);
    render();
  }catch(e){
    document.getElementById('app').innerHTML=`<section class='locked'><h2>${TXT.bad}</h2><p><code>#key=...</code></p></section>`;
  }
}

window.addEventListener('hashchange',boot);
boot();
