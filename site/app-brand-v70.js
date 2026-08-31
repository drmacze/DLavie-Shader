(() => {
  'use strict';
  const COMMUNITY='community.html?v=85#global';
  const active=(location.hash||'').replace(/^#\/?/,'').split('?')[0];
  if(active==='community'){location.replace(COMMUNITY);return}

  document.addEventListener('click',event=>{
    const el=event.target instanceof Element?event.target.closest('a[href="#community"],a[href*="#community"],[data-route-link="community"]'):null;
    if(!el)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();location.href=COMMUNITY;
  },true);

  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const GH_MARK='assets/icon-github.svg?v=85';
  const GH_LOCKUP='assets/logo-github-official.svg?v=85';
  const MC_BEDROCK='https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/logos/icon_bedrock.jpg';
  function ensureAssets(){
    if(!document.querySelector('link[data-updates-v85]')){const l=document.createElement('link');l.rel='stylesheet';l.href='updates-v85.css?v=85';l.dataset.updatesV85='1';document.head.appendChild(l)}
    if(!document.querySelector('script[data-updates-v85]')){const s=document.createElement('script');s.src='updates-v85.js?v=85';s.dataset.updatesV85='1';document.body.appendChild(s)}
    if(!document.querySelector('script[data-routing-v85]')){const s=document.createElement('script');s.src='routing-v85.js?v=85';s.dataset.routingV85='1';document.body.appendChild(s)}
  }
  function github(){
    $$('.project-page img[src*="icon-github.svg"]').forEach(img=>{img.src=GH_MARK;img.alt='GitHub';img.classList.add('github-mark')});
    $$('.official-github-lockup img').forEach(img=>{img.src=GH_LOCKUP;img.alt='GitHub'});
    const linksCard=$$('.project-sidebar .side-card').find(card=>/tautan|links|source/i.test($('h3',card)?.textContent||''));
    if(linksCard&&!$('.official-github-lockup',linksCard)){
      const source=$('.side-links a[href*="github.com"]',linksCard)?.href||'https://github.com/drmacze/DLavie-Shader';
      linksCard.insertAdjacentHTML('beforeend',`<a class="official-github-lockup" href="${source}" target="_blank" rel="noreferrer" aria-label="Buka project di GitHub"><img src="${GH_LOCKUP}" alt="GitHub"></a>`);
    }
  }
  function minecraft(){
    const compat=$$('.project-sidebar .side-card').find(card=>/kompatibilitas|compatibility/i.test($('h3',card)?.textContent||''));
    if(!compat||$('.minecraft-official-card',compat))return;
    const label=$('.mc-brand-row span:last-child',compat)?.textContent||'Minecraft';
    const card=document.createElement('a');card.className='minecraft-official-card';card.href='https://www.minecraft.net/';card.target='_blank';card.rel='noreferrer';
    card.innerHTML=`<img src="${MC_BEDROCK}" alt="Minecraft" loading="lazy" decoding="async" fetchpriority="low"><span><strong>${label}</strong><span>minecraft.net ↗</span></span>`;compat.appendChild(card);
  }
  function contextMenu(){const menu=$('#projectMenu');if(menu)$$('a[href*="github.com"] img',menu).forEach(img=>{img.src=GH_MARK;img.alt=''})}
  function centerBrand(){$$('.brand-logo,.hero-project-icon,.project-icon,.brand-icon,.round-action img').forEach(el=>{el.style.objectPosition='50% 50%';el.style.transform='none'})}
  function accountLinks(){$$('a[href*="account.html"]').forEach(a=>{const signed=(()=>{try{const v=JSON.parse(localStorage.getItem('dlavie.auth.state.v1')||'null');return !!(v===true||v?.signedIn||v?.userId)}catch{return false}})();a.setAttribute('href',signed?'account.html?v=85#profile':'account.html?v=85')})}
  function communityLinks(){$$('a[href="#community"],a[href*="#community"]').forEach(a=>a.setAttribute('href',COMMUNITY))}
  function run(){ensureAssets();github();minecraft();contextMenu();centerBrand();accountLinks();communityLinks()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('hashchange',()=>{const h=(location.hash||'').replace(/^#\/?/,'').split('?')[0];if(h==='community'){location.replace(COMMUNITY);return}setTimeout(run,0)},{passive:true});
})();