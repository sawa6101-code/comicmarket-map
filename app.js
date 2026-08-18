const STORAGE='comicmarket-map-v5';
const OFFICIAL='https://www.comiket.co.jp/info-a/C108/C108CtlgMap.html';
const MAPS=[['東123','東123'],['東7','東7'],['西12','西12'],['南12','南12'],['全地区','全地区']];
const STATUS=[['ALL','すべて'],['UNVISITED','未訪問'],['PLANNED','購入予定'],['COMPLETED','購入済み'],['SOLD_OUT','完売']];
let state={day:'1日目',map:'東123',filter:'ALL',circles:[]};
let pendingPos=null,editingId=null,detailId=null,channel=null;
try{channel=new BroadcastChannel('comicmarket-map-live')}catch{}
const $=id=>document.getElementById(id);
const yen=n=>'¥'+Math.round(Number(n)||0).toLocaleString('ja-JP');
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
const statusLabel=s=>({UNVISITED:'未訪問',PLANNED:'購入予定',COMPLETED:'購入済み',SOLD_OUT:'完売'}[s]||'未訪問');
const circleTotal=c=>(c.items||[]).reduce((n,i)=>n+(Number(i.qty)||0)*(Number(i.price)||0),0);
const itemTotal=c=>(c.items||[]).reduce((n,i)=>n+(Number(i.qty)||0),0);
function normalize(){state.circles=(state.circles||[]).map(c=>({...c,items:Array.isArray(c.items)?c.items:[{name:c.item||'',qty:Number(c.qty)||1,price:Number(c.price)||0}],status:c.status||'UNVISITED'}));}
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE)||'null');if(x&&Array.isArray(x.circles))state=x}catch{}normalize();render()}
function save(broadcast=true){normalize();localStorage.setItem(STORAGE,JSON.stringify(state));if(broadcast&&channel)channel.postMessage(state);render()}
if(channel)channel.onmessage=e=>{if(e.data&&Array.isArray(e.data.circles)){state=e.data;normalize();render()}};
window.addEventListener('storage',e=>{if(e.key===STORAGE)load()});
function filtered(){const q=($('search')?.value||'').trim().toLowerCase();return state.circles.filter(c=>c.day===state.day&&c.map===state.map&&(state.filter==='ALL'||c.status===state.filter)&&(!q||[c.name,c.space,c.buyer,...(c.items||[]).map(i=>i.name)].join(' ').toLowerCase().includes(q)))}
function render(){
 $('days').innerHTML=['1日目','2日目','3日目'].map(d=>`<button class="${state.day===d?'active':''}" data-day="${d}">${d}</button>`).join('');
 $('maps').innerHTML=MAPS.map(([k,l])=>`<button class="${state.map===k?'active':''}" data-map="${k}">${l}</button>`).join('');
 $('filters').innerHTML=STATUS.map(([k,l])=>`<button class="${state.filter===k?'active':''}" data-filter="${k}">${l}</button>`).join('');
 $('mapTitle').textContent=`${state.day}・${state.map}`;
 $('officialMap').src=OFFICIAL;
 renderMarkers();renderTotals();renderList();renderDetail();
}
function renderMarkers(){$('markers').innerHTML=state.circles.filter(c=>c.day===state.day&&c.map===state.map).map(c=>`<button class="marker ${c.status==='COMPLETED'?'completed':c.status==='SOLD_OUT'?'sold':c.status==='PLANNED'?'planned':''}" data-marker="${c.id}" title="${esc(c.name)}" style="left:${c.x*100}%;top:${c.y*100}%" aria-label="${esc(c.name)}"></button>`).join('')}
function renderTotals(){
 const rows=filtered(),allDay=state.circles.filter(c=>c.day===state.day),total=allDay.reduce((n,c)=>n+circleTotal(c),0),items=allDay.reduce((n,c)=>n+itemTotal(c),0);
 $('circleCount').textContent=rows.length+'件';$('circleCount2').textContent=allDay.length;$('itemCount').textContent=items;$('grandTotal').textContent=yen(total);
 $('dayTotals').innerHTML=['1日目','2日目','3日目'].map(d=>{const t=state.circles.filter(c=>c.day===d).reduce((n,c)=>n+circleTotal(c),0);return `<div class="day-total"><span>${d}</span><strong>${yen(t)}</strong></div>`}).join('');
 const buyers={};allDay.forEach(c=>{const b=c.buyer?.trim()||'未指定';buyers[b]=(buyers[b]||0)+circleTotal(c)});$('buyerTotals').innerHTML=Object.entries(buyers).sort((a,b)=>b[1]-a[1]).map(([b,t])=>`<div class="buyer-total"><span>👤 ${esc(b)}</span><strong>${yen(t)}</strong></div>`).join('')||'<span class="muted">購入者がまだ登録されていません</span>';
}
function renderList(){const rows=filtered();$('empty').classList.toggle('hidden',rows.length>0);$('list').innerHTML=rows.map(c=>`<article class="purchase" data-open="${c.id}"><div><h3>${esc(c.name)} <span class="status ${c.status}">${statusLabel(c.status)}</span></h3><p>${esc(c.space)} ・ 👤 ${esc(c.buyer||'未入力')}</p><div>${(c.items||[]).map(i=>`<span class="item-chip">${esc(i.name||'商品')} ×${Number(i.qty)||0} ${yen((Number(i.qty)||0)*(Number(i.price)||0))}</span>`).join('')}</div><div class="action-row"><button class="ghost statusBtn" data-id="${c.id}" data-status="UNVISITED">未訪問</button><button class="ghost statusBtn" data-id="${c.id}" data-status="PLANNED">購入予定</button><button class="ghost statusBtn" data-id="${c.id}" data-status="COMPLETED">購入済み</button><button class="ghost statusBtn" data-id="${c.id}" data-status="SOLD_OUT">完売</button></div></div><div class="money">${yen(circleTotal(c))}<br><small>${esc(c.map)} ${esc(c.space)}</small></div></article>`).join('')}
function renderDetail(){const c=state.circles.find(x=>x.id===detailId);if(!c){$('detail').classList.add('hidden');return}$('detail').classList.remove('hidden');$('detail').innerHTML=`<div class="section-head"><div><h2>${esc(c.name)}</h2><p class="muted">${esc(c.day)}・${esc(c.map)}・${esc(c.space)}</p></div><button class="ghost" id="closeDetail">閉じる</button></div><p>👤 購入者：<strong>${esc(c.buyer||'未入力')}</strong></p><div>${(c.items||[]).map(i=>`<div class="item-chip">${esc(i.name)} ×${Number(i.qty)||0}　${yen((Number(i.qty)||0)*(Number(i.price)||0))}</div>`).join('')}</div><h3 style="text-align:right">合計 ${yen(circleTotal(c))}</h3><div class="action-row"><button class="button primary" id="focusMap">📍 マップで表示</button><button class="ghost" id="editCircle">編集</button><button class="ghost" id="deleteCircle">削除</button></div>`;$('closeDetail').onclick=()=>{detailId=null;renderDetail()};$('focusMap').onclick=()=>{focusMarker(c);detailId=null;renderDetail()};$('editCircle').onclick=()=>openForm(c.x,c.y,c.id);$('deleteCircle').onclick=()=>{if(confirm('このサークルを削除しますか？')){state.circles=state.circles.filter(x=>x.id!==c.id);detailId=null;save()}}}
function focusMarker(c){state.day=c.day;state.map=c.map;render();setTimeout(()=>document.querySelector(`[data-marker="${c.id}"]`)?.scrollIntoView({behavior:'smooth',block:'center',inline:'center'}),50)}
function openForm(x,y,id=null){pendingPos={x,y};editingId=id;const c=id?state.circles.find(v=>v.id===id):null;$('positionText').textContent=`地図位置：${(x*100).toFixed(1)}% / ${(y*100).toFixed(1)}%`;$('circleName').value=c?.name||'';$('space').value=c?.space||'';$('buyer').value=c?.buyer||'';$('itemRows').innerHTML='';(c?.items?.length?c.items:[{name:'',qty:1,price:0}]).forEach(addItemRow);$('saveCircle').textContent=id?'変更を保存':'登録する';$('formCard').classList.remove('hidden');updateFormTotal();$('circleName').focus()}
function closeForm(){pendingPos=null;editingId=null;$('formCard').classList.add('hidden')}
function addItemRow(item={name:'',qty:1,price:0}){const row=document.createElement('div');row.className='item-row';row.innerHTML=`<label>商品<input class="i-name" value="${esc(item.name)}" placeholder="新刊など"></label><label>数量<input class="i-qty" type="number" min="1" value="${Number(item.qty)||1}"></label><label>単価<input class="i-price" type="number" min="0" value="${Number(item.price)||0}"></label><button class="ghost removeItem" type="button">×</button>`;row.querySelectorAll('input').forEach(i=>i.addEventListener('input',updateFormTotal));row.querySelector('.removeItem').onclick=()=>{row.remove();updateFormTotal()};$('itemRows').appendChild(row)}
function getFormItems(){return [...document.querySelectorAll('.item-row')].map(r=>({name:r.querySelector('.i-name').value.trim(),qty:Number(r.querySelector('.i-qty').value)||1,price:Number(r.querySelector('.i-price').value)||0})).filter(i=>i.name)}
function updateFormTotal(){$('formTotal').textContent=yen(getFormItems().reduce((n,i)=>n+i.qty*i.price,0))}
$('days').onclick=e=>{const b=e.target.closest('[data-day]');if(b){state.day=b.dataset.day;render()}};
$('maps').onclick=e=>{const b=e.target.closest('[data-map]');if(b){state.map=b.dataset.map;render()}};
$('filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(b){state.filter=b.dataset.filter;render()}};
$('registerMode').onclick=()=>{const on=$('tapLayer').classList.toggle('hidden')===false;$('mapModeHint').classList.toggle('hidden',!on);$('registerMode').textContent=on?'登録モード終了':'＋ 地図から登録'};
$('tapLayer').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();openForm((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);$('tapLayer').classList.add('hidden');$('mapModeHint').classList.add('hidden');$('registerMode').textContent='＋ 地図から登録'};
$('markers').onclick=e=>{const b=e.target.closest('[data-marker]');if(!b)return;detailId=b.dataset.marker;renderDetail()};
$('cancelForm').onclick=closeForm;$('addItem').onclick=()=>addItemRow();$('saveCircle').onclick=()=>{if(!pendingPos)return alert('地図上の位置を指定してください');const name=$('circleName').value.trim(),space=$('space').value.trim(),items=getFormItems();if(!name||!space)return alert('サークル名とスペースは必須です');if(!items.length)return alert('購入するものを1件以上入力してください');const base={day:state.day,map:state.map,name,space,buyer:$('buyer').value.trim(),items,x:pendingPos.x,y:pendingPos.y};if(editingId){const c=state.circles.find(x=>x.id===editingId);Object.assign(c,base)}else state.circles.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),...base,status:'UNVISITED'});save();closeForm()};
$('search').oninput=render;$('list').onclick=e=>{const s=e.target.closest('.statusBtn');if(s){const c=state.circles.find(x=>x.id===s.dataset.id);if(c){c.status=s.dataset.status;save()}return}const a=e.target.closest('[data-open]');if(a){detailId=a.dataset.open;renderDetail()}};
$('officialLink').onclick=()=>window.open(OFFICIAL,'_blank','noopener');
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-nav]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const n=b.dataset.nav;if(n==='map')window.scrollTo({top:0,behavior:'smooth'});if(n==='list')$('list').scrollIntoView({behavior:'smooth'});if(n==='money')document.querySelector('.totals').scrollIntoView({behavior:'smooth'})});
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').classList.remove('hidden')});$('installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
load();