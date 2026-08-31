(() => {
  'use strict';
  const ACCOUNT='account.html?v=75#overview';
  const APP='app.html?v=80';
  const card=document.querySelector('.project-card');
  if(card&&!card.querySelector('.home-mc-brand')){
    const tags=card.querySelector('.tag-row');
    const badge='<span class="home-mc-brand"><img src="assets/icon-minecraft-block.svg?v=80" alt=""><span>Minecraft</span></span>';
    if(tags)tags.insertAdjacentHTML('beforebegin',badge);else card.insertAdjacentHTML('beforeend',badge);
  }
  const footer=document.querySelector('.footer .wrap');
  if(footer&&!footer.querySelector('.home-brand-note')){
    footer.insertAdjacentHTML('beforeend','<span class="home-brand-note">DLavie adalah project independen dan tidak berafiliasi dengan Mojang atau Microsoft.</span>');
  }
  document.querySelectorAll('a[href*="github.com/drmacze/DLavie-Shader"]').forEach(a=>{
    if(!a.querySelector('img')){a.classList.add('home-github-link');a.insertAdjacentHTML('afterbegin','<img src="assets/icon-github.svg?v=80" alt="GitHub">')}
  });
  document.querySelectorAll('a[href^="account.html"]').forEach(a=>a.setAttribute('href',ACCOUNT));
  document.querySelectorAll('a[href^="app.html"]').forEach(a=>{
    const hash=(a.getAttribute('href').split('#')[1]||'downloads');
    a.setAttribute('href',`${APP}#${hash}`);
  });
  if(!document.querySelector('script[data-public-project-sync]')){
    const s=document.createElement('script');
    s.src='public-project-sync-v80.js?v=80';
    s.dataset.publicProjectSync='1';
    document.body.appendChild(s);
  }
})();
