(() => {
  'use strict';
  const signed=(()=>{try{const v=JSON.parse(localStorage.getItem('dlavie.auth.state.v1')||'null');return !!(v===true||v?.signedIn||v?.userId)}catch{return false}})();
  const ACCOUNT=signed?'account.html?v=85#profile':'account.html?v=85';
  const APP='app.html?v=85';
  const COMMUNITY='community.html?v=85#global';

  const visual=document.querySelector('.hero .visual');if(visual)visual.style.display='none';
  document.querySelectorAll('.discover .result').forEach(el=>el.remove());
  document.querySelectorAll('.hero .cta a[href*="#project/"]').forEach(a=>a.hidden=true);

  const footer=document.querySelector('.footer .wrap');
  if(footer&&!footer.querySelector('.home-brand-note'))footer.insertAdjacentHTML('beforeend','<span class="home-brand-note">DLavie adalah project independen dan tidak berafiliasi dengan Mojang atau Microsoft.</span>');
  document.querySelectorAll('a[href*="github.com/drmacze/DLavie-Shader"]').forEach(a=>{if(!a.querySelector('img')){a.classList.add('home-github-link');a.insertAdjacentHTML('afterbegin','<img src="assets/icon-github.svg?v=85" alt="GitHub">')}});
  document.querySelectorAll('a[href^="account.html"]').forEach(a=>a.setAttribute('href',ACCOUNT));
  document.querySelectorAll('a[href^="app.html"]').forEach(a=>{const hash=(a.getAttribute('href').split('#')[1]||'downloads');a.setAttribute('href',`${APP}#${hash}`)});
  document.querySelectorAll('a[href*="#community"],a[data-route-link="community"]').forEach(a=>a.setAttribute('href',COMMUNITY));
  if(!document.querySelector('script[data-routing-v85]')){const s=document.createElement('script');s.src='routing-v85.js?v=85';s.dataset.routingV85='1';document.body.appendChild(s)}
})();