(() => {
  'use strict';
  const valid = new Set(['overview','saved','profile','security','preferences','data']);
  const $all = (s,r=document) => [...r.querySelectorAll(s)];

  function loadEasyUsername(){
    if(document.querySelector('script[data-dlavie-easy-username]')) return;
    const script=document.createElement('script');
    script.src='username-easy.js';
    script.dataset.dlavieEasyUsername='true';
    script.defer=true;
    document.head.appendChild(script);
  }

  function loadDeveloperLayer(){
    if(!document.querySelector('link[data-dlavie-developer-layer]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='account-developer-v71.css?v=73';
      link.dataset.dlavieDeveloperLayer='true';
      document.head.appendChild(link);
    }
    if(!document.querySelector('script[data-dlavie-developer-layer]')){
      const script=document.createElement('script');
      script.src='account-developer-v73.js?v=73';
      script.dataset.dlavieDeveloperLayer='true';
      script.defer=true;
      document.head.appendChild(script);
    }
  }

  function scheduleIdle(fn, timeout=1400){
    if('requestIdleCallback' in window) window.requestIdleCallback(fn,{timeout});
    else setTimeout(fn,650);
  }

  function warmHomeCache(){
    const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    if(connection?.saveData) return;
    const local=[
      './',
      'modrinth.css',
      'modrinth.js',
      'modrinth-core.js',
      'modrinth-v2.css',
      'modrinth-home.css',
      'light-vibrant.css',
      'assets/dlavie-mark.svg',
      'assets/dlavie-shader.svg'
    ];
    local.forEach(url=>fetch(url,{cache:'force-cache',credentials:'same-origin'}).catch(()=>{}));
  }

  function cameFromMainApp(){
    if(!document.referrer) return false;
    try{
      const ref=new URL(document.referrer);
      if(ref.origin!==location.origin) return false;
      const here=location.pathname.replace(/account\.html$/,'');
      return ref.pathname===here || ref.pathname===`${here}index.html`;
    }catch{return false;}
  }

  function fastHomeReturn(event){
    const link=event.target.closest('a[href="./#home"]');
    if(!link) return;
    if(!cameFromMainApp()) return;
    event.preventDefault();
    let left=false;
    window.addEventListener('pagehide',()=>{left=true},{once:true});
    history.back();
    setTimeout(()=>{
      if(!left && document.visibilityState==='visible') location.href='./#home';
    },420);
  }

  function activeSectionFromHash(){
    const raw = location.hash.replace(/^#/, '').toLowerCase();
    return valid.has(raw) ? raw : 'overview';
  }

  function applySection(name, {updateUrl=false} = {}){
    if(!valid.has(name)) name = 'overview';
    $all('[data-panel]').forEach(button => {
      const active = button.dataset.panel === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    $all('[data-account-panel]').forEach(panel => {
      const active = panel.dataset.accountPanel === name;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if(updateUrl && location.hash !== `#${name}`){
      history.pushState({accountSection:name}, '', `${location.pathname}${location.search}#${name}`);
    }
    const activePanel = document.querySelector(`[data-account-panel="${name}"]`);
    if(activePanel && !document.querySelector('#accountView')?.hidden){
      const heading = activePanel.querySelector('h2');
      if(heading) document.title = `${heading.textContent} — DLavie Account`;
    }
  }

  function ensureSingleAuthForm(){
    const forms = ['loginForm','registerForm','resetRequestForm','resetPasswordForm']
      .map(id => document.getElementById(id)).filter(Boolean);
    const visible = forms.filter(form => !form.hidden);
    if(visible.length <= 1) return;
    visible.slice(1).forEach(form => { form.hidden = true; });
  }

  function bind(){
    loadEasyUsername();
    loadDeveloperLayer();
    scheduleIdle(warmHomeCache);

    document.addEventListener('click', fastHomeReturn, true);
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-panel]');
      if(!button) return;
      const name = button.dataset.panel;
      if(!valid.has(name)) return;
      applySection(name, {updateUrl:true});
      if(matchMedia('(max-width: 640px)').matches){
        document.querySelector('.account-tabs')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });

    window.addEventListener('hashchange', () => applySection(activeSectionFromHash()));
    window.addEventListener('popstate', () => applySection(activeSectionFromHash()));

    const authObserver = new MutationObserver(ensureSingleAuthForm);
    const authView = document.getElementById('authView');
    if(authView) authObserver.observe(authView,{subtree:true,attributes:true,attributeFilter:['hidden']});

    const accountView = document.getElementById('accountView');
    if(accountView){
      const accountObserver = new MutationObserver(() => {
        if(!accountView.hidden) applySection(activeSectionFromHash());
      });
      accountObserver.observe(accountView,{attributes:true,attributeFilter:['hidden']});
    }

    ensureSingleAuthForm();
    applySection(activeSectionFromHash());
  }

  window.DLavieAccountFlow={applySection,activeSectionFromHash};
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();
})();
