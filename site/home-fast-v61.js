(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);

  function isHomeRoute(){
    const hash=(location.hash||'').replace(/^#\/?/,'').split('?')[0].toLowerCase();
    return !hash || hash==='home';
  }

  function sheetIsOpen(){
    const sheet=$('#mobileSheet');
    return !!sheet && sheet.classList.contains('open') && sheet.getAttribute('aria-hidden')==='false';
  }

  function hardResetBackdrop(){
    const back=$('#sheetBackdrop');
    if(!back || sheetIsOpen()) return;
    back.hidden=true;
    back.setAttribute('aria-hidden','true');
    back.style.display='none';
    back.style.opacity='0';
    back.style.pointerEvents='none';
    back.style.backdropFilter='none';
    back.style.webkitBackdropFilter='none';
    document.body.style.overflow='';
  }

  function forceHomeTop(){
    if(!isHomeRoute()) return;
    try{ history.scrollRestoration='manual'; }catch{}
    window.scrollTo({top:0,left:0,behavior:'auto'});
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
  }

  function settleHomeEntry(){
    if(!isHomeRoute()) return;
    forceHomeTop();
    requestAnimationFrame(()=>{
      forceHomeTop();
      requestAnimationFrame(forceHomeTop);
    });
    setTimeout(forceHomeTop,70);
    setTimeout(forceHomeTop,220);
  }

  function closeBeforeNavigation(event){
    const link=event.target.closest('#mobileSheet a,.mobile-sheet a');
    if(!link) return;
    const sheet=$('#mobileSheet');
    sheet?.classList.remove('open');
    sheet?.setAttribute('aria-hidden','true');
    hardResetBackdrop();
  }

  function init(){
    hardResetBackdrop();
    settleHomeEntry();
    document.addEventListener('click',closeBeforeNavigation,true);
    requestAnimationFrame(hardResetBackdrop);
    setTimeout(hardResetBackdrop,80);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.addEventListener('pageshow',()=>{
    hardResetBackdrop();
    settleHomeEntry();
  },{passive:true});

  window.addEventListener('hashchange',()=>requestAnimationFrame(()=>{
    hardResetBackdrop();
    if(isHomeRoute()) settleHomeEntry();
  }),{passive:true});

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible') hardResetBackdrop();
  },{passive:true});
})();
