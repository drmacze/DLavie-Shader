(() => {
  'use strict';

  const $ = (s,r=document) => r.querySelector(s);

  function icon(path){
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
  }

  function buildHero(){
    const hero=$('.page[data-route="home"] .home-hero');
    if(!hero || hero.dataset.polished==='true') return;
    hero.dataset.polished='true';
    document.body.classList.add('home-polish-active');

    const children=[...hero.children];
    const copy=document.createElement('div');
    copy.className='home-hero-copy';
    children.forEach(node=>copy.appendChild(node));

    const eyebrow=copy.querySelector('.eyebrow');
    if(eyebrow) eyebrow.textContent='DLAVIE / PROJECT HOME';
    const title=copy.querySelector('h1');
    if(title) title.innerHTML='Builds worth<br><span>coming back to.</span>';
    const lede=copy.querySelector('.hero-lede');
    if(lede) lede.textContent='A focused home for DLavie releases, changelogs, downloads, community discussion, feedback, and everything currently being built.';

    const primary=copy.querySelector('.hero-actions .primary-button');
    if(primary){
      primary.href='#project/dlavie-shader';
      primary.innerHTML=`${icon('M12 3v12m0 0 5-5m-5 5-5-5M5 20h14')}Open DLavie Shader`;
    }
    const secondary=copy.querySelector('.hero-actions .secondary-button');
    if(secondary){ secondary.href='#community'; secondary.textContent='Join community'; }

    const meta=document.createElement('div');
    meta.className='hero-inline-meta';
    meta.innerHTML='<span><b>DLavie Shader</b> active</span><i></i><span>Account system live</span><i></i><span>Community realtime</span>';
    copy.appendChild(meta);

    const visual=document.createElement('aside');
    visual.className='home-hero-visual';
    visual.setAttribute('aria-label','Featured DLavie project');
    visual.innerHTML=`
      <div class="home-visual-frame">
        <div class="home-visual-card">
          <div class="home-visual-top"><span class="home-live-label">CURRENT BUILD</span><span class="home-version-pill">v0.1.2</span></div>
          <div class="home-visual-project">
            <img src="assets/dlavie-shader.svg" alt="DLavie Shader">
            <div><span class="home-visual-kicker">MINECRAFT BEDROCK</span><h2>DLavie Shader</h2><p>Vibrant Visuals + PBR Enhanced with mobile-first quality presets.</p></div>
          </div>
          <div class="home-visual-stats">
            <div class="home-visual-stat"><strong>4 presets</strong><span>Low → Ultra</span></div>
            <div class="home-visual-stat"><strong>PBR</strong><span>Enhanced</span></div>
            <div class="home-visual-stat"><strong>Mobile</strong><span>First</span></div>
          </div>
          <a class="home-visual-open" href="#project/dlavie-shader">View project ${icon('M5 12h14m-5-5 5 5-5 5')}</a>
        </div>
        <div class="home-float-note"><strong>Terrain-aware light</strong>Volumetric godrays · 0.1.2</div>
      </div>`;

    hero.append(copy,visual);
  }

  function buildPortals(){
    const home=$('.page[data-route="home"]');
    const stats=home?.querySelector('.stat-strip');
    if(!home || !stats || home.querySelector('.home-portals')) return;
    const portals=document.createElement('section');
    portals.className='shell home-portals';
    portals.innerHTML=`
      <a class="home-portal primary" href="#downloads">
        <span class="home-portal-icon">${icon('M12 3v12m0 0 5-5m-5 5-5-5M5 20h14')}</span>
        <h3>Projects</h3><p>Releases, versions, changelogs, compatibility, and trusted download surfaces.</p><span class="home-portal-arrow">→</span>
      </a>
      <a class="home-portal" href="community.html">
        <span class="home-portal-icon">${icon('M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z')}</span>
        <h3>Community</h3><p>Live global discussion, reactions, replies, reporting, and moderation.</p><span class="home-portal-arrow">→</span>
      </a>
      <a class="home-portal" href="account.html">
        <span class="home-portal-icon">${icon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0')}</span>
        <h3>DLavie Account</h3><p>One identity for Community, profile, security, preferences, and future DLavie services.</p><span class="home-portal-arrow">→</span>
      </a>`;
    stats.insertAdjacentElement('afterend',portals);
  }

  function refineExisting(){
    const home=$('.page[data-route="home"]');
    if(!home) return;
    const featuredHeading=home.querySelector('.section-heading .section-kicker');
    if(featuredHeading) featuredHeading.textContent='FEATURED PROJECT';
    const featuredTitle=featuredHeading?.parentElement?.querySelector('h2');
    if(featuredTitle) featuredTitle.textContent='Shipping now.';
    const why=[...home.querySelectorAll('.section-kicker')].find(el=>el.textContent.trim()==='WHY DLAVIE');
    const whyTitle=why?.parentElement?.querySelector('h2');
    if(whyTitle) whyTitle.textContent='Built to stay useful.';
  }

  function syncAccountPortal(){
    const portal=$('.home-portal[href="account.html"]');
    if(!portal) return;
    const logged=document.documentElement.dataset.auth==='member';
    const title=portal.querySelector('h3');
    const copy=portal.querySelector('p');
    if(logged){
      if(title) title.textContent='Your account';
      if(copy) copy.textContent='Manage your DLavie profile, security, preferences, sessions, and account data.';
    }else{
      if(title) title.textContent='DLavie Account';
      if(copy) copy.textContent='Sign in once for Community, profile, security, preferences, and future DLavie services.';
    }
  }

  function addPointerDepth(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;
    const frame=$('.home-visual-frame');
    if(!frame || frame.dataset.pointerDepth) return;
    frame.dataset.pointerDepth='true';
    frame.addEventListener('pointermove',event=>{
      const r=frame.getBoundingClientRect();
      const x=(event.clientX-r.left)/r.width-.5;
      const y=(event.clientY-r.top)/r.height-.5;
      frame.style.transform=`perspective(900px) rotateX(${(-y*2.4).toFixed(2)}deg) rotateY(${(x*3.2).toFixed(2)}deg) rotateZ(1.2deg)`;
    });
    frame.addEventListener('pointerleave',()=>{ frame.style.transform='rotate(1.2deg)'; });
  }

  function init(){
    buildHero();
    buildPortals();
    refineExisting();
    syncAccountPortal();
    addPointerDepth();

    const rootObserver=new MutationObserver(syncAccountPortal);
    rootObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-auth']});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
