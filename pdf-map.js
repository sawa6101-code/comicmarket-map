(() => {
  const PDFS={
    '東123':'https://www.comiket.co.jp/info-a/C108/C108Map_e123_B4.pdf',
    '東456':'https://www.comiket.co.jp/info-a/C107/C107Map_e456_B4.pdf',
    '西12':'https://www.comiket.co.jp/info-a/C108/C108Map_w12_B4.pdf'
  };
  const cache=new Map(); let pdfJsPromise=null; let active='';
  function loadPdfJs(){
    if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
    if(pdfJsPromise)return pdfJsPromise;
    pdfJsPromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.async=true;
      s.onload=()=>{if(!window.pdfjsLib)return reject(new Error('PDF.js unavailable'));window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve(window.pdfjsLib)};
      s.onerror=reject; document.head.appendChild(s);
    }); return pdfJsPromise;
  }
  async function getPdf(url){if(cache.has(url))return cache.get(url);const p=window.pdfjsLib.getDocument({url,disableAutoFetch:false,disableStream:false}).promise;cache.set(url,p);return p;}
  async function render(){
    const title=document.getElementById('mapTitle'),canvas=document.getElementById('pdfMapCanvas'),img=document.getElementById('mapImage'),box=document.getElementById('mapViewport'),mapCanvas=document.getElementById('mapCanvas');
    if(!title||!canvas||!box||!mapCanvas)return;
    const map=(title.textContent.match(/・([^・]+)$/)||[])[1],url=PDFS[map]; if(!url)return;
    if(active===map&&canvas.dataset.ready==='1')return;
    active=map;canvas.dataset.ready='0';canvas.style.display='block';canvas.style.visibility='hidden';if(img)img.style.display='none';
    try{
      const pdf=await getPdf(url),page=await pdf.getPage(1),base=page.getViewport({scale:1});
      const targetWidth=Math.min(5000,Math.max(3000,box.clientWidth*4));
      const renderScale=targetWidth/base.width,view=page.getViewport({scale:renderScale});
      canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);canvas.style.width='100%';canvas.style.height='100%';
      mapCanvas.style.aspectRatio=`${base.width}/${base.height}`;mapCanvas.style.width='100%';mapCanvas.style.maxWidth='100%';
      const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});await page.render({canvasContext:ctx,viewport:view}).promise;
      canvas.dataset.ready='1';canvas.style.visibility='visible';
    }catch(err){console.warn('Official PDF map render failed',map,err);canvas.style.visibility='visible';if(img)img.style.display=map==='東456'?'none':'block';active='';}
  }
  let scheduled=false;
  function enhance(){if(scheduled)return;scheduled=true;const run=()=>{scheduled=false;loadPdfJs().then(render).catch(()=>{scheduled=false})};if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:1500});else setTimeout(run,100);}
  document.addEventListener('click',e=>{if(e.target.closest('[data-map],#zoomIn,#zoomOut,#zoomReset'))setTimeout(enhance,0)},{passive:true});
  window.addEventListener('resize',()=>{if(active){active='';setTimeout(enhance,80)}},{passive:true});
  window.CMHighResMap={refresh:()=>{active='';enhance()}};
})();
