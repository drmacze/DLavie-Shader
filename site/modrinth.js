(() => {
  'use strict';

  const SUPABASE_URL = 'https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const authState = { checked:false, session:null, client:null, promise:null };

  const isCommunityRoute = () => {
    const hash = (location.hash || '').replace(/^#\/?/, '').toLowerCase();
    return hash === 'community' || hash.startsWith('community?') || hash.startsWith('community/');
  };

  const openCommunity = () => {
    const target = new URL('community.html', location.href);
    location.replace(target.href);
  };

  function loadSupabase(){
    if(window.supabase) return Promise.resolve(window.supabase);
    return new Promise((resolve,reject) => {
      const existing = document.querySelector('script[data-dlavie-supabase]');
      if(existing){ existing.addEventListener('load',()=>resolve(window.supabase),{once:true}); existing.addEventListener('error',reject,{once:true}); return; }
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.async=true;
      s.dataset.dlavieSupabase='true';
      s.onload=()=>resolve(window.supabase);
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  async function ensureSession(){
    if(authState.checked) return authState.session;
    if(authState.promise) return authState.promise;
    authState.promise=(async()=>{
      try{
        const lib=await loadSupabase();
        authState.client=lib.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
        const {data}=await authState.client.auth.getSession();
        authState.session=data.session||null;
        authState.checked=true;
        authState.client.auth.onAuthStateChange((_event,session)=>{
          authState.session=session||null;
          authState.checked=true;
          updateAccountUI();
        });
      }catch{
        authState.session=null;
        authState.checked=true;
      }
      updateAccountUI();
      return authState.session;
    })();
    return authState.promise;
  }

  function accountHref(reason='access'){
    const next = reason === 'community' ? '&next=community' : '';
    return `account.html?mode=login&reason=${encodeURIComponent(reason)}${next}`;
  }

  function requireAccount(reason='access'){
    try{ localStorage.setItem('dlavie.auth.return.v1', location.href); }catch{}
    location.href=accountHref(reason);
  }

  function injectGateStyles(){
    if(document.querySelector('#dlavieAuthGateStyles')) return;
    const style=document.createElement('style');
    style.id='dlavieAuthGateStyles';
    style.textContent=`
      .auth-explore-note{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:18px 0 0;padding:13px 15px;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12);color:#aab0b8;font-size:12px}
      .auth-explore-note b{color:#fff}.auth-explore-note a{padding:8px 12px;border-radius:999px;background:#fff;color:#0b0c0e;font-weight:800;white-space:nowrap}
      .auth-required-lock{position:relative}.auth-required-lock:after{content:'ACCOUNT';position:absolute;right:-4px;top:-7px;padding:3px 5px;border-radius:999px;background:#fff;color:#08090a;font:700 7px/1 'JetBrains Mono',monospace;letter-spacing:.08em}
      @media(max-width:640px){.auth-explore-note{align-items:flex-start;flex-direction:column}.auth-explore-note a{width:100%;text-align:center}}
    `;
    document.head.appendChild(style);
  }

  function noteFor(route,copy){
    const page=document.querySelector(`.page[data-route="${route}"]`);
    if(!page) return;
    const head=page.querySelector('.page-head') || page.querySelector('.shell');
    if(!head || head.querySelector('.auth-explore-note')) return;
    const note=document.createElement('div');
    note.className='auth-explore-note';
    note.innerHTML=`<span><b>Explore mode.</b> ${copy}</span><a href="${accountHref(route)}">Sign in</a>`;
    head.appendChild(note);
  }

  function updateAccountUI(){
    injectGateStyles();
    const loggedIn=!!authState.session;
    document.documentElement.dataset.auth=loggedIn?'member':'guest';

    document.querySelectorAll('[data-dlavie-account-link]').forEach(link=>{
      link.href='account.html';
      if(link.classList.contains('sheet-action')){
        const svg=link.querySelector('svg')?.outerHTML || '';
        link.innerHTML=`${svg}${loggedIn?'Account':'Sign in'}`;
      }else link.textContent=loggedIn?'Account':'Sign in';
    });

    const download=document.querySelector('#downloadLatest');
    if(download){
      download.classList.toggle('auth-required-lock',!loggedIn);
      download.title=loggedIn?'Download latest version':'Sign in to download';
    }

    if(!loggedIn){
      noteFor('feedback','Sign in is required to submit feedback. You can still browse the page.');
      noteFor('vote','Sign in is required to cast roadmap votes.');
    }else{
      document.querySelectorAll('.auth-explore-note').forEach(n=>n.remove());
      document.querySelectorAll('.auth-required-lock').forEach(n=>n.classList.remove('auth-required-lock'));
    }
  }

  const injectAccountLinks = () => {
    const actions = document.querySelector('.header-actions');
    if(actions && !actions.querySelector('[data-dlavie-account-link]')){
      const link=document.createElement('a');
      link.className='quiet-button';
      link.href='account.html';
      link.dataset.dlavieAccountLink='true';
      link.textContent=authState.session?'Account':'Sign in';
      actions.appendChild(link);
    }

    const sheet=document.querySelector('#mobileSheet');
    if(sheet && !sheet.querySelector('[data-dlavie-account-link]')){
      const link=document.createElement('a');
      link.className='sheet-action';
      link.href='account.html';
      link.dataset.dlavieAccountLink='true';
      link.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'+(authState.session?'Account':'Sign in');
      sheet.insertBefore(link,sheet.firstElementChild?.nextElementSibling||null);
    }
    updateAccountUI();
  };

  function gatedClickTarget(target){
    if(!(target instanceof Element)) return null;
    return target.closest('#downloadLatest,.download-version,[data-vote]');
  }

  document.addEventListener('click',event=>{
    const gated=gatedClickTarget(event.target);
    if(!gated || authState.session) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    const reason=gated.matches('[data-vote]')?'vote':'download';
    ensureSession().then(session=>{
      if(session){
        requestAnimationFrame(()=>gated.click());
      }else requireAccount(reason);
    });
  },true);

  document.addEventListener('submit',event=>{
    const form=event.target;
    if(!(form instanceof HTMLFormElement) || form.id!=='feedbackForm' || authState.session) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    ensureSession().then(session=>{
      if(session) requestAnimationFrame(()=>form.requestSubmit());
      else requireAccount('feedback');
    });
  },true);

  if(isCommunityRoute()){
    openCommunity();
    return;
  }

  window.addEventListener('hashchange',()=>{
    if(isCommunityRoute()) openCommunity();
    else requestAnimationFrame(updateAccountUI);
  },{passive:true});

  const core=document.createElement('script');
  core.src='modrinth-core.js';
  core.defer=true;
  core.onload=()=>{
    injectAccountLinks();
    const observer=new MutationObserver(injectAccountLinks);
    observer.observe(document.body,{childList:true,subtree:true});
    ensureSession();
  };
  document.head.appendChild(core);
})();
