(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const GH_MARK='assets/icon-github.svg?v=70';
  const GH_LOCKUP='assets/logo-github-official.svg?v=70';
  const MC_BEDROCK='https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/logos/icon_bedrock.jpg';
  function github(){
    $$('.project-page img[src*="icon-github.svg"]').forEach(img=>{img.src=GH_MARK;img.alt='GitHub';img.classList.add('github-mark')});
    $$('.official-github-lockup img').forEach(img=>{img.src=GH_LOCKUP;img.alt='GitHub'});
    const linksCard=$$('.project-sidebar .side-card').find(card=>/tautan/i.test($('h3',card)?.textContent||''));
    if(linksCard&&!$('.official-github-lockup',linksCard)){
      const source=$('.side-links a[href*="github.com"]',linksCard)?.href||'https://github.com/drmacze/DLavie-Shader';
      linksCard.insertAdjacentHTML('beforeend',`<a class="official-github-lockup" href="${source}" target="_blank" rel="noreferrer" aria-label="Buka project di GitHub"><img src="${GH_LOCKUP}" alt="GitHub"></a>`);
    }
  }
  function minecraft(){
    const compat=$$('.project-sidebar .side-card').find(card=>/kompatibilitas/i.test($('h3',card)?.textContent||''));
    if(!compat||$('.minecraft-official-card',compat))return;
    const label=$('.mc-brand-row span:last-child',compat)?.textContent||'Minecraft Bedrock';
    const card=document.createElement('a');
    card.className='minecraft-official-card';
    card.href='https://www.minecraft.net/';
    card.target='_blank';card.rel='noreferrer';
    card.innerHTML=`<img src="${MC_BEDROCK}" alt="Minecraft Bedrock" loading="lazy" decoding="async" fetchpriority="low"><span><strong>${label}</strong><span>Logo/icon resmi Minecraft · minecraft.net ↗</span></span>`;
    const disclaimer=$('.brand-disclaimer',compat);compat.insertBefore(card,disclaimer||null);
  }
  function contextMenu(){
    const menu=$('#projectMenu');if(!menu)return;
    $$('a[href*="github.com"] img',menu).forEach(img=>{img.src=GH_MARK;img.alt=''});
  }
  function centerBrand(){
    $$('.brand-logo,.hero-project-icon,.project-icon,.brand-icon,.round-action img').forEach(el=>{el.style.objectPosition='50% 50%';el.style.transform='none'});
  }
  function accountLinks(){
    $$('a[href^="account.html"]').forEach(a=>{
      const raw=a.getAttribute('href')||'account.html';
      try{
        const u=new URL(raw,location.href);
        u.searchParams.set('v','75');
        if(!u.hash)u.hash='overview';
        a.setAttribute('href','account.html'+u.search+u.hash);
      }catch(_){a.setAttribute('href','account.html?v=75#overview')}
    });
  }
  function run(){github();minecraft();contextMenu();centerBrand();accountLinks()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('hashchange',()=>setTimeout(run,0),{passive:true});
})();