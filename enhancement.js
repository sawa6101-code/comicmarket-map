(() => {
  // v12: status timestamps + custom circle sorting
  const originalRender = window.renderList;
  const statusLabels = {UNVISITED:'未訪問',PLANNED:'購入予定',COMPLETED:'購入済み',SOLD_OUT:'完売'};

  function stampStatus(c, next) {
    const now = new Date().toISOString();
    if (next === 'COMPLETED') c.completedAt = now;
    else if (next === 'SOLD_OUT') c.soldOutAt = now;
    // A timestamp is meaningful only for the two requested statuses.
    if (next !== 'COMPLETED') delete c.completedAt;
    if (next !== 'SOLD_OUT') delete c.soldOutAt;
  }

  function statusTime(c) {
    const v = c.status === 'COMPLETED' ? c.completedAt : c.status === 'SOLD_OUT' ? c.soldOutAt : null;
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function charRank(ch) {
    if (/^[ぁ-ゖ]$/.test(ch)) return 0;
    if (/^[ァ-ヺ]$/.test(ch)) return 1;
    if (/^[A-Z]$/.test(ch)) return 2;
    if (/^[a-z]$/.test(ch)) return 3;
    if (/^[0-9]$/.test(ch)) return 4;
    return 5;
  }
  function compareSpace(a, b) {
    const clean = s => String(s || '').trim().replace(/\s+/g,'');
    const aa = clean(a), bb = clean(b);
    const dirRank = s => s.startsWith('東') ? 0 : s.startsWith('西') ? 1 : s.startsWith('南') ? 2 : 3;
    const da=dirRank(aa), db=dirRank(bb);
    if (da !== db) return da-db;
    const a2=aa.slice(1), b2=bb.slice(1);
    let i=0;
    while(i<a2.length && i<b2.length){
      const ca=a2[i], cb=b2[i];
      if (/\d/.test(ca) && /\d/.test(cb)) {
        const ma=a2.slice(i).match(/^\d+/)[0], mb=b2.slice(i).match(/^\d+/)[0];
        const na=Number(ma), nb=Number(mb);
        if(na!==nb) return na-nb;
        i+=Math.max(ma.length,mb.length); continue;
      }
      const ra=charRank(ca), rb=charRank(cb);
      if(ra!==rb) return ra-rb;
      if(ca!==cb) return ca.localeCompare(cb,'ja');
      i++;
    }
    return a2.length-b2.length;
  }

  function sortedRows(rows) { return [...rows].sort((a,b)=>compareSpace(a.space,b.space) || String(a.name||'').localeCompare(String(b.name||''),'ja')); }

  window.renderList = function(){
    const rs = sortedRows(window.rows());
    const empty=document.getElementById('empty');
    empty.classList.toggle('hidden',rs.length>0);
    document.getElementById('list').innerHTML=rs.map(c=>`<article class="purchase" data-open="${c.id}"><div><h3>${window.esc(c.name)} <span class="status ${c.status}">${statusLabels[c.status]}</span></h3><p>${window.esc(c.space)} ・ 📍 ${window.esc(c.traveler||'未指定')} ・ 👤 ${window.esc(c.buyer||'未入力')}</p><div>${(c.items||[]).map(i=>`<span class="item-chip">${window.esc(i.name)} ×${i.qty} ${window.yen(i.qty*i.price)}</span>`).join('')}</div>${statusTime(c)?`<p class="status-time">${c.status==='COMPLETED'?'購入済み':'完売'}：${statusTime(c)}</p>`:''}<div class="action-row">${[['UNVISITED','未訪問'],['PLANNED','購入予定'],['COMPLETED','購入済み'],['SOLD_OUT','完売']].map(s=>`<button type="button" class="ghost statusBtn" data-id="${c.id}" data-status="${s[0]}">${s[1]}</button>`).join('')}</div></div><div class="money">${window.yen(window.total(c))}</div></article>`).join('');
  };

  // Replace the existing status click delegation with timestamp-aware handling.
  const list=document.getElementById('list');
  list.addEventListener('click',e=>{
    const s=e.target.closest('.statusBtn');
    if(!s) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const c=window.state.circles.find(x=>x.id===s.dataset.id);
    if(!c) return;
    stampStatus(c,s.dataset.status);
    c.status=s.dataset.status;
    window.save();
    // save() redraws the map and list, so the marker color/status is immediate.
  },true);

  // Ensure marker/details also expose the recorded time.
  const originalRenderDetail=window.renderDetail;
  window.renderDetail=function(){
    originalRenderDetail();
    const c=window.state.circles.find(x=>x.id===window.detail);
    if(!c) return;
    const t=statusTime(c);
    if(t){
      const p=document.createElement('p'); p.className='status-time';
      p.textContent=`${c.status==='COMPLETED'?'購入済み':'完売'}：${t}`;
      document.getElementById('detail').appendChild(p);
    }
  };

  // Sort button: insert once, next to the circle-list heading.
  const cards=document.querySelectorAll('.card');
  const listCard=[...cards].find(x=>x.querySelector('#list'));
  // The list is rendered in a following card, so locate its heading by #list parent.
  const listEl=document.getElementById('list');
  if(listEl){
    const head=listEl.closest('.card')?.querySelector('.section-head');
    if(head && !document.getElementById('sortList')){
      const b=document.createElement('button');
      b.id='sortList'; b.type='button'; b.className='ghost'; b.textContent='並び順：東→西→南';
      head.appendChild(b);
      b.onclick=()=>{ b.classList.toggle('active'); b.textContent=b.classList.contains('active')?'並び順：スペース順✓':'並び順：東→西→南'; window.renderList(); };
    }
  }

  // Live cross-tab refresh: map/list/status changes made in another tab are reflected immediately.
  window.addEventListener('storage',e=>{ if(e.key==='comicmarket-map-v7'){ try{window.state=JSON.parse(e.newValue||'{}'); window.normalize(); window.render();}catch{} } });
  window.addEventListener('resize',()=>{ try{window.applyTransform();}catch{} });

  // Initial migration for older records.
  try { window.state.circles.forEach(c=>{ if(c.status!=='COMPLETED') delete c.completedAt; if(c.status!=='SOLD_OUT') delete c.soldOutAt; }); } catch {}
})();
