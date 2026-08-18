const STORAGE='comicmarket-map-v4';
const OFFICIAL='https://www.comiket.co.jp/info-a/C108/C108CtlgMap.html';
const MAPS=[['東123','東123'],['東7','東7'],['西12','西12'],['南12','南12']];
let state={day:'1日目',map:'東123',circles:[]};
let pendingPos=null;
let channel=null;
try{channel=new BroadcastChannel('comicmarket-map-live')}catch{}

const $=id=>document.getElementById(id);
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE)||'null');if(x&&Array.isArray(x.circles))state=x}catch{};render()}
function save(broadcast=true){localStorage.setItem(STORAGE,JSON.stringify(state));if(broadcast&&channel)channel.postMessage(state);render()}
if(channel)channel.onmessage=e=>{if(e.data&&Array.isArray(e.data.circles)){state=e.data;render()}};
window.addEventListener('storage',e=>{if(e.key===STORAGE)load()});

function render(){
  $('days').innerHTML=['1日目','2日目','3日目'].map(d=>`<button class="${state.day===d?'active':''}" data-day="${d}">${d}</button>`).join('');
  $('maps').innerHTML=MAPS.map(([k,l])=>`<button class="${state.map===k?'active':''}" data-map="${k}">${l}</button>`).join('');
  $('mapTitle').textContent=`${state.day}・${state.map}`;
  $('officialMap').src=OFFICIAL;
  $('officialLink').href=OFFICIAL;
  $('markers').innerHTML=state.circles.filter(c=>c.day===state.day&&c.map===state.map).map(c=>`<span class="marker ${c.status==='COMPLETED'?'completed':c.status==='SOLD_OUT'?'sold':''}" title="${esc(c.name)}" style="left:${c.x*100}%;top:${c.y*100}%"></span>`).join('');
  const q=($('search').value||'').trim().toLowerCase();
  const rows=state.circles.filter(c=>c.day===state.day && (!q||[c.name,c.space,c.buyer,c.item].join(' ').toLowerCase().includes(q)));
  $('circleCount').textContent=rows.length;
  $('itemCount').textContent=rows.reduce((n,c)=>n+(Number(c.qty)||0),0);
  $('grandTotal').textContent=yen(rows.reduce((n,c)=>n+(Number(c.qty)||0)*(Number(c.price)||0),0));
  $('list').innerHTML=rows.map(c=>`<article class="purchase"><div><h3>${esc(c.name)} <span class="status ${c.status}">${labelStatus(c.status)}</span></h3><p>${esc(c.space)} ・ 購入者：${esc(c.buyer||'未入力')}</p><p>${esc(c.item||'購入品未入力')} × ${Number(c.qty)||0}</p><p><button class="ghost statusBtn" data-id="${c.id}" data-status="UNVISITED">未訪問</button> <button class="ghost statusBtn" data-id="${c.id}" data-status="COMPLETED">訪問済み</button> <button class="ghost statusBtn" data-id="${c.id}" data-status="SOLD_OUT">完売</button></p></div><div class="money">${yen((Number(c.qty)||0)*(Number(c.price)||0))}<br><small>単価 ${yen(Number(c.price)||0)}</small></div></article>`).join('');
  $('empty').classList.toggle('hidden',rows.length>0);
}
function labelStatus(s){return s==='COMPLETED'?'訪問済み':s==='SOLD_OUT'?'完売':'未訪問'}
function yen(n){return '¥'+Math.round(n).toLocaleString('ja-JP')}
function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function openForm(x,y){pendingPos={x,y};$('positionText').textContent=`地図上の位置：${Math.round(x*1000)/10}% / ${Math.round(y*1000)/10}%`;$('formCard').classList.remove('hidden');$('circleName').focus()}
function closeForm(){pendingPos=null;$('formCard').classList.add('hidden')}

$('days').onclick=e=>{const b=e.target.closest('[data-day]');if(!b)return;state.day=b.dataset.day;render()};
$('maps').onclick=e=>{const b=e.target.closest('[data-map]');if(!b)return;state.map=b.dataset.map;render()};
$('registerMode').onclick=()=>{$('tapLayer').classList.toggle('hidden');$('registerMode').textContent=$('tapLayer').classList.contains('hidden')?'＋ 地図上から登録':'登録モードを終了'};
$('tapLayer').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();openForm((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);$('tapLayer').classList.add('hidden');$('registerMode').textContent='＋ 地図上から登録'};
$('cancelForm').onclick=closeForm;
$('qty').oninput=$('price').oninput=()=>{$('formTotal').textContent=yen((Number($('qty').value)||0)*(Number($('price').value)||0))};
$('saveCircle').onclick=()=>{if(!pendingPos){alert('地図上の登録位置を指定してください');return}const name=$('circleName').value.trim();const space=$('space').value.trim();if(!name||!space){alert('サークル名とスペースは必須です');return}state.circles.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),day:state.day,map:state.map,name,space,buyer:$('buyer').value.trim(),item:$('item').value.trim(),qty:Number($('qty').value)||1,price:Number($('price').value)||0,status:'UNVISITED',x:pendingPos.x,y:pendingPos.y});save();['circleName','space','buyer','item'].forEach(id=>$(id).value='');$('qty').value=1;$('price').value=0;$('formTotal').textContent='¥0';closeForm()};
$('search').oninput=render;
$('list').onclick=e=>{const b=e.target.closest('.statusBtn');if(!b)return;const c=state.circles.find(x=>x.id===b.dataset.id);if(c){c.status=b.dataset.status;save()}};
$('resetAll').onclick=()=>{if(confirm('登録したサークル・購入情報をすべて削除します。よろしいですか？')){state={day:'1日目',map:'東123',circles:[]};save()}};
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').classList.remove('hidden')});$('installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
load();
