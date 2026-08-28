(() => {
  'use strict';

  const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"/></svg>';

  function makeCategoryNav(){
    if(document.querySelector('.dlv-category-nav')) return;
    const nav=document.createElement('nav');
    nav.className='dlv-category-nav';
    nav.setAttribute('aria-label','Kategori Minecraft');
    nav.innerHTML=`<div class="dlv-category-nav-inner">
      <a href="#downloads">Mods</a>
      <a href="#downloads">Resource Packs</a>
      <a class="active" href="#downloads">Shaders</a>
      <a href="#downloads">Add-ons</a>
      <a href="#downloads">Bedrock</a>
      <a href="#downloads">Java</a>
    </div>`;
    const desktop=document.querySelector('.desktop-header');
    if(desktop) desktop.insertAdjacentElement('afterend',nav);
    else document.body.prepend(nav);
  }

  function rebuildHome(){
    const home=document.querySelector('.page[data-route="home"]');
    if(!home) return;
    document.body.classList.add('modrinth-home-v4');

    const hero=home.querySelector('.home-hero');
    if(hero){
      hero.innerHTML=`
        <div class="mr-home-copy">
          <p class="eyebrow">DLAVIE FOR MINECRAFT</p>
          <h1>Tempatnya project Minecraft untuk
            <span class="mr-word-wrap" aria-label="shader, mod, resource pack, addon">
              <span class="mr-word">shader</span>
              <span class="mr-word">mod</span>
              <span class="mr-word">resource pack</span>
              <span class="mr-word">add-on</span>
            </span>
          </h1>
          <p class="hero-lede">Temukan, pelajari, dan download project Minecraft buatan DLavie dengan versi, kompatibilitas, changelog, dan file rilis yang jelas.</p>
          <div class="hero-actions">
            <a class="primary-button" href="#downloads">Jelajahi project</a>
            <a class="secondary-button" href="#project/dlavie-shader">DLavie Shader</a>
          </div>
        </div>
        <div class="mr-home-showcase" aria-label="Project unggulan DLavie">
          <div class="mr-showcase-stack">
            <div class="mr-showcase-orb"></div>
            <a class="mr-float-card main" href="#project/dlavie-shader">
              <img src="assets/dlavie-shader.svg" alt="DLavie Shader">
              <div><small>Project unggulan</small><strong>DLavie Shader</strong><p>Vibrant Visuals + PBR untuk Minecraft Bedrock.</p></div>
              <div class="mr-mini-tags"><span>Shader</span><span>Bedrock</span><span>PBR</span></div>
            </a>
            <a class="mr-float-card release" href="#project/dlavie-shader?tab=versions"><small>Latest release</small><b>v0.1.2 · Godrays Pass</b><em>Lihat versi →</em></a>
            <a class="mr-float-card feature" href="#project/dlavie-shader"><small>Built for</small><b>Mobile-first visual quality</b><em>Low → Ultra</em></a>
          </div>
        </div>`;
    }

    const sections=[...home.querySelectorAll('.section-space')];
    const first=sections[0];
    if(first){
      const heading=first.querySelector('.section-heading');
      if(heading){
        heading.innerHTML=`<div><span class="section-kicker">FOR PLAYERS</span><h2>Temukan project yang kamu butuhkan</h2></div><a href="#downloads">Lihat semua →</a>`;
      }
      if(!first.querySelector('.mr-discovery-copy')){
        const copy=document.createElement('p');
        copy.className='mr-discovery-copy';
        copy.textContent='Cari berdasarkan nama, kategori, atau platform. Informasi penting ditampilkan langsung supaya kamu tidak perlu menebak file mana yang harus diunduh.';
        heading?.insertAdjacentElement('afterend',copy);
      }
      if(!first.querySelector('.mr-discovery-toolbar')){
        const toolbar=document.createElement('div');
        toolbar.className='mr-discovery-toolbar';
        toolbar.innerHTML=`<button class="mr-discovery-search" type="button">${searchIcon}<span>Cari project...</span></button><a class="mr-discovery-sort" href="#downloads">Urutkan: Relevan</a>`;
        const copy=first.querySelector('.mr-discovery-copy');
        copy?.insertAdjacentElement('afterend',toolbar);
        toolbar.querySelector('button')?.addEventListener('click',()=>{
          const mobile=document.querySelector('#mobileSearch');
          const desktop=document.querySelector('#searchOpen');
          (mobile || desktop)?.click();
        });
      }

      const featured=first.querySelector('.featured-project');
      if(featured){
        const p=featured.querySelector('.featured-copy > p');
        if(p) p.textContent='Shader Vibrant Visuals + PBR untuk Minecraft Bedrock dengan godrays, material vanilla-faithful, dan preset performa mobile.';
      }
    }

    const mobileBrand=document.querySelector('.dlv-mobile-brand span');
    if(mobileBrand) mobileBrand.textContent='DLavie';
  }

  function init(){
    makeCategoryNav();
    rebuildHome();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
