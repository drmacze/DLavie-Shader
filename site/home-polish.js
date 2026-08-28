(() => {
  'use strict';

  const $ = (s,r=document) => r.querySelector(s);

  function icon(path){
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
  }

  function setupHero(){
    const hero=$('.page[data-route="home"] .home-hero');
    if(!hero || hero.dataset.organized==='true') return;
    hero.dataset.organized='true';
    document.body.classList.add('home-polish-active');

    hero.querySelector('.home-hero-copy')?.replaceWith(...hero.querySelector('.home-hero-copy').childNodes);
    hero.querySelector('.home-hero-visual')?.remove();

    const eyebrow=hero.querySelector('.eyebrow');
    if(eyebrow) eyebrow.textContent='DLAVIE / HOME';

    const title=hero.querySelector('h1');
    if(title) title.innerHTML='Projects, releases,<br><span>all in one place.</span>';

    const lede=hero.querySelector('.hero-lede');
    if(lede) lede.textContent='A simple home for DLavie projects — releases, changelogs, community, feedback, and everything currently being built.';

    const primary=hero.querySelector('.hero-actions .primary-button');
    if(primary){
      primary.href='#project/dlavie-shader';
      primary.innerHTML=`${icon('M12 3v12m0 0 5-5m-5 5-5-5M5 20h14')}Open DLavie Shader`;
    }

    const secondary=hero.querySelector('.hero-actions .secondary-button');
    if(secondary){
      secondary.href='#downloads';
      secondary.textContent='Browse projects';
    }

    hero.querySelector('.hero-inline-meta')?.remove();
    const meta=document.createElement('div');
    meta.className='home-status-row';
    meta.innerHTML='<span><i></i>1 active project</span><span>Latest v0.1.2</span><span>Minecraft Bedrock</span>';
    hero.appendChild(meta);
  }

  function buildQuickLinks(){
    const home=$('.page[data-route="home"]');
    const stats=home?.querySelector('.stat-strip');
    if(!home || !stats) return;
    home.querySelector('.home-portals')?.remove();
    if(home.querySelector('.home-quicklinks')) return;

    const section=document.createElement('section');
    section.className='shell home-quicklinks';
    section.innerHTML=`
      <a href="#downloads" class="home-quicklink">
        <span class="home-quicklink-icon">${icon('M4 6h16M4 12h16M4 18h10')}</span>
        <span><strong>Projects</strong><small>Browse DLavie releases</small></span>
        <b>→</b>
      </a>
      <a href="community.html" class="home-quicklink">
        <span class="home-quicklink-icon">${icon('M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z')}</span>
        <span><strong>Community</strong><small>Global realtime chat</small></span>
        <b>→</b>
      </a>
      <a href="account.html" class="home-quicklink">
        <span class="home-quicklink-icon">${icon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0')}</span>
        <span><strong>Account</strong><small>Profile and security</small></span>
        <b>→</b>
      </a>`;
    stats.insertAdjacentElement('afterend',section);
  }

  function refineSections(){
    const home=$('.page[data-route="home"]');
    if(!home) return;

    const kickers=[...home.querySelectorAll('.section-kicker')];
    const featured=kickers.find(el=>/FEATURED/.test(el.textContent));
    if(featured){
      featured.textContent='FEATURED PROJECT';
      const title=featured.parentElement?.querySelector('h2');
      if(title) title.textContent='DLavie Shader';
    }

    const why=kickers.find(el=>el.textContent.trim()==='WHY DLAVIE');
    if(why){
      const title=why.parentElement?.querySelector('h2');
      if(title) title.textContent='Made to stay clear.';
    }

    const featuredCard=home.querySelector('.featured-project');
    const featuredIcon=featuredCard?.querySelector('.project-icon');
    if(featuredIcon) featuredIcon.src='assets/dlavie-shader.svg';
  }

  function init(){
    setupHero();
    buildQuickLinks();
    refineSections();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
