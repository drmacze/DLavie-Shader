(() => {
  'use strict';

  function load(src){
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=src;
      script.onload=resolve;
      script.onerror=()=>reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  (async()=>{
    try{
      await load('community-auth-bridge.js');
      if(window.DLavieAuthBridge?.ready) await window.DLavieAuthBridge.ready;
      await load('community-core.js');
      await load('community-patch.js');
    }catch(error){
      console.error('[DLavie Community]',error);
      const loading=document.querySelector('#chatLoading');
      if(loading) loading.innerHTML='<p>Community could not start. Refresh the page or sign in again.</p>';
    }
  })();
})();
