(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  function isHome(){
    const route=(location.hash||'').replace(/^#\/?/,'').split('?')[0].toLowerCase();
    return !route||route==='home';
  }

  function menuOpen(){
    const sheet=$('#mobileSheet');
    return !!sheet&&sheet.classList.contains('open')&&sheet.getAttribute('aria-hidden')==='false';
  }

  function resetClosedLayers(){
    if(menuOpen()) return;
    const back=$('#sheetBackdrop');
    if(back){
      back.hidden=true;
      back.setAttribute('aria-hidden','true');
      back.style.cssText+=';display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;';
    }
    const sheet=$('#mobileSheet');
    if(sheet&&!sheet.classList.contains('open')){
      sheet.setAttribute('aria-hidden','true');
      sheet.style.pointerEvents='none';
    }
    document.body.style.overflow='';
  }

  function normalizeImages(){
    $$('.page:not(.active) img').forEach(img=>{
      img.loading='lazy';
      img.decoding='async';
      try{img.fetchPriority='low';}catch{}
    });
    $$('.page.active img').forEach(img=>{img.decoding='async';});
  }

  function markReady(){
    document.documentElement.dataset.homeReady='1';
    resetClosedLayers();
    if(isHome()){
      const home=$('.page[data-route="home"]');
      if(home){
        home.style.overflowX='clip';
        home.style.overflowY='visible';
      }
    }
  }

  function closeBeforeRoute(e){
    const link=e.target.closest('#mobileSheet a,.mobile-sheet a');
    if(!link) return;
    const sheet=$('#mobileSheet');
    sheet?.classList.remove('open');
    sheet?.setAttribute('aria-hidden','true');
    resetClosedLayers();
  }

  function init(){
    resetClosedLayers();
    normalizeImages();
    document.addEventListener('click',closeBeforeRoute,true);
    requestAnimationFrame(()=>{
      resetClosedLayers();
      markReady();
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.addEventListener('load',markReady,{once:true,passive:true});
  window.addEventListener('pageshow',()=>{resetClosedLayers();normalizeImages();markReady();},{passive:true});
  window.addEventListener('hashchange',()=>requestAnimationFrame(()=>{resetClosedLayers();normalizeImages();markReady();}),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')resetClosedLayers();},{passive:true});
})();
