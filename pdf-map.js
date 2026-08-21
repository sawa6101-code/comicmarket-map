(() => {
  const PDFS={
    '東123':'https://www.comiket.co.jp/info-a/C108/C108Map_e123_B4.pdf',
    '東456':'https://www.comiket.co.jp/info-a/C107/C107Map_e456_B4.pdf',
    '西12':'https://www.comiket.co.jp/info-a/C108/C108Map_w12_B4.pdf'
  };
  const cache=new Map(); let pdfJsPromise=null; let active='';
  const $=id=>document.getElementById(id);
  function showImmediate(map,url){
    const frame=$('pdfMapFrame'),img=$('mapImage'),canvas=$('pdfMapCanvas');
    if(!frame||!url)return;
    frame.src=url;
    frame.style.display='block';
    frame.style.visibility='visible';
    if(img){img.style.display='none';img.style.visibility='hidden'}
    if(canvas){canvas.style.display='none';canvas.style.visibility='hidden';canvas.dataset.ready='0'}
    active=map;
  }
  function loadPdfJs(){
    if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
    if(pdfJsPromise)return pdfJsPromise;
    pdfJsPromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.async=true;
      s.onload=()=>{if(!window.pdfjsLib)return reject(new Error('PDF.js unavailable'));window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve(window.pdfjsLib)};
      s.onerror=reject;document.head.appendChild(s);
    });return pdfJsPromise;
  }
  function getPdf(url){
    if(cache.has(url))return cache.get(url);
    const p=window.pdfjsLib.getDocument({url,disableAutoFetch:false,disableStream:false}).promise;
    cache.set(url,p);return p;
  }
  async function enhance(){
    const title=$('mapTitle'),canvas=$('pdfMapCanvas'),box=$('mapViewport'),mapCanvas=$('mapCanvas');
    if(!title||!canvas||!box||!mapCanvas)return;
    const map=(title.textContent.match(/・([^・]+)$/)||[])[1],url=PDFS[map];
    if(!url){active='';canvas.style.display='none';const f=$('pdfMapFrame');if(f)f.style.display='none';const img=$('mapImage');if(img){img.style.display='block';img.style.visibility='visible'}return}
    // Always put the official PDF on screen first. This is immediate and does not depend on CORS/PDF.js.
    if(active!==map)showImmediate(map,url);
    try{
      const pdf=await getPdf(url),page=await pdf.getPage(1),base=page.getViewport({scale:1});
      const targetWidth=Math.min(6000,Math.max(3600,box.clientWidth*4));
      const view=page.getViewport({scale:targetWidth/base.width});
      canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);
      canvas.style.width='100%';canvas.style.height='100%';canvas.style.display='block';canvas.style.visibility='hidden';
      mapCanvas.style.aspectRatio=`${base.width}/${base.height}`;
      const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
      await page.render({canvasContext:ctx,viewport:view}).promise;
      canvas.dataset.ready='1';canvas.style.visibility='visible';
      const frame=$('pdfMapFrame');if(frame)frame.style.display='none';
      active=map;
    }catch(err){
      // Keep the native official PDF visible when cross-origin PDF.js rendering is unavailable.
      console.warn('PDF.js unavailable; native official PDF remains visible',map,err);
      canvas.style.display='none';canvas.dataset.ready='0';
      const frame=$('pdfMapFrame');if(frame){frame.style.display='block';frame.style.visibility='visible'}
      active=map;
    }
  }
  let timer=0;
  function refresh(){clearTimeout(timer);timer=setTimeout(enhance,0)}
  document.addEventListener('click',e=>{if(e.target.closest('[data-map],#zoomIn,#zoomOut,#zoomReset'))refresh()},{passive:true});
  window.addEventListener('resize',()=>{active='';refresh()},{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
  window.CMHighResMap={refresh:()=>{active='';refresh()}};
})();
