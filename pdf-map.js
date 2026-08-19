(() => {
  const PDFS={
    '東123':'https://www.comiket.co.jp/info-a/C108/C108Map_e123_B4.pdf',
    '東456':'https://www.comiket.co.jp/info-a/C107/C107Map_e456_B4.pdf',
    '西12':'https://www.comiket.co.jp/info-a/C108/C108Map_w12_B4.pdf'
  };
  let last='';
  async function render(){
    const title=document.getElementById('mapTitle');const canvas=document.getElementById('pdfMapCanvas');const img=document.getElementById('mapImage');
    if(!title||!window.pdfjsLib||!canvas)return;const map=(title.textContent.match(/・([^・]+)$/)||[])[1];const url=PDFS[map];
    if(!url||url===last)return;if(window.CMEvent?.get?.()!=='C108'&&map!=='東456')return;last=url;
    try{const task=pdfjsLib.getDocument({url});const pdf=await task.promise;const page=await pdf.getPage(1);const base=page.getViewport({scale:1});const dpr=Math.min(3,window.devicePixelRatio||1);const box=document.getElementById('mapViewport');const width=Math.max(320,box.clientWidth);const scale=width/base.width*dpr;const view=page.getViewport({scale});canvas.width=view.width;canvas.height=view.height;canvas.style.width=(view.width/dpr)+'px';canvas.style.height=(view.height/dpr)+'px';await page.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;img.style.display='none';canvas.style.display='block';document.getElementById('mapCanvas').style.aspectRatio=base.width/base.height;}
    catch(e){console.warn('Official PDF rendering failed; local map fallback is used.',e);img.style.display='block';canvas.style.display='none';last='';}
  }
  window.addEventListener('load',()=>{setTimeout(render,200)});setInterval(render,800);
})();
