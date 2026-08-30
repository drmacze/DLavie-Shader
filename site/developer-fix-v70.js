(() => {
  'use strict';

  /* Keep /developer.html out of normal public navigation. The short team route
     forwards here with an internal marker; actual access is still enforced by
     Supabase Auth + dlavie_developers/RLS inside developer.js. */
  try {
    const params = new URLSearchParams(location.search);
    const teamEntry = params.get('team') === 'dlv-ops-9f2c';
    const topLevel = window.top === window.self;
    const sameOriginParent = !topLevel && window.top.location.origin === window.location.origin;
    if ((topLevel && !teamEntry) || (!topLevel && !sameOriginParent)) {
      window.location.replace('index.html');
      return;
    }
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex,nofollow,noarchive,nosnippet';
  } catch (_) {
    window.location.replace('index.html');
    return;
  }

  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const MC_BEDROCK='https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/logos/icon_bedrock.jpg';
  function refreshAssets(){
    $$('img[src*="dlavie-mark.svg"]').forEach(i=>i.src='assets/dlavie-mark.svg?v=73');
    $$('img[src*="icon-github.svg"]').forEach(i=>i.src='assets/icon-github.svg?v=73');
    const bedrock=$('#platformBedrock')?.closest('.choice')?.querySelector('.choice-icon img');
    if(bedrock){bedrock.src=MC_BEDROCK;bedrock.alt='Minecraft Bedrock';bedrock.loading='lazy';bedrock.decoding='async'}
    const repo=$('#githubRepo')?.closest('.form-section');
    if(repo&&!$('.official-console-brand',repo))repo.insertAdjacentHTML('beforeend','<a class="official-console-brand" href="https://github.com/" target="_blank" rel="noreferrer"><img src="assets/logo-github-official.svg?v=73" alt="GitHub"><span>GitHub source integration</span></a>');
    const foot=$('.nav-foot span:last-child');if(foot)foot.textContent='v73';
  }
  function accessBadge(){
    const top=$('.top-actions');if(!top||$('.console-badge',top))return;
    const b=document.createElement('span');b.className='console-badge';b.textContent='Developer';top.prepend(b);
  }
  function run(){refreshAssets();accessBadge()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
