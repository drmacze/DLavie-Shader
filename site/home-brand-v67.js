(() => {
  'use strict';
  const ACCOUNT='account.html?v=81#profile';
  const APP='app.html?v=81';

  // Never expose the old static project as a fallback. Supabase owns public state.
  const visual=document.querySelector('.hero .visual');
  if(visual)visual.style.display='none';
  document.querySelectorAll('.discover .result').forEach(el=>el.remove());
  document.querySelectorAll('.hero .cta a[href*="#project/"]').forEach(a=>a.hidden=true);

  const card=document.querySelector('.project-card');
  if(card&&!card.querySelector('.home-mc-brand')){
    const tags=card.querySelector('.tag-row');
    const badge='<span class="home-mc-brand"><img src="assets/icon-minecraft-block.svg?v=81" alt=""><span>Minecraft</span></span>';
    if(tags)tags.insertAdjacentHTML('beforebegin',badge);else card.insertAdjacentHTML('beforeend',badge);
  }
  const footer=document.querySelector('.footer .wrap');
  if(footer&&!footer.querySelector('.home-brand-note')){
    footer.insertAdjacentHTML('beforeend','<span class="home-brand-note">DLavie adalah project independen dan tidak berafiliasi dengan Mojang atau Microsoft.</span>');
  }
  document.querySelectorAll('a[href*="github.com/drmacze/DLavie-Shader"]').forEach(a=>{
    if(!a.querySelector('img')){a.classList.add('home-github-link');a.insertAdjacentHTML('afterbegin','<img src="assets/icon-github.svg?v=81" alt="GitHub">')}
  });
  document.querySelectorAll('a[href^="account.html"]').forEach(a=>a.setAttribute('href',ACCOUNT));
  document.querySelectorAll('a[href^="app.html"]').forEach(a=>{
    const hash=(a.getAttribute('href').split('#')[1]||'downloads');
    a.setAttribute('href',`${APP}#${hash}`);
  });
  if(!document.querySelector('script[data-public-project-sync]')){
    const s=document.createElement('script');
    s.src='public-project-sync-v80.js?v=81';
    s.dataset.publicProjectSync='1';
    document.body.appendChild(s);
  }
  if(!document.querySelector('script[data-dlv-session-nav]')){
    const s=document.createElement('script');
    s.src='session-nav-v81.js?v=81';
    s.dataset.dlvSessionNav='1';
    document.body.appendChild(s);
  }

  // The stale project is already hidden/removed above. Release the first-paint
  // guard now so a live public project can be revealed by the database sync.
  document.documentElement.classList.remove('dlv-project-sync-pending');
})();
