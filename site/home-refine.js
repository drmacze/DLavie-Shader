(() => {
  'use strict';

  const THEME_KEY = 'dlavie.theme.v1';
  const root = document.documentElement;
  const home = document.querySelector('.page[data-route="home"]');

  const sunIcon = '<svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const moonIcon = '<svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.4 8.4 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z"/></svg>';

  function storedTheme(){
    try{
      const value = localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    }catch{return null;}
  }

  function preferredTheme(){
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function activeTheme(){
    return root.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function syncThemeMeta(theme){
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.content = theme === 'light' ? '#f6f7f9' : '#111214';
  }

  function updateThemeControls(){
    const theme = activeTheme();
    const nextLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', nextLabel);
      button.setAttribute('title', nextLabel);
      button.setAttribute('aria-pressed', String(theme === 'light'));
      const label = button.querySelector('[data-theme-label]');
      if(label) label.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
      const sun = button.querySelector('.theme-icon-sun');
      const moon = button.querySelector('.theme-icon-moon');
      if(!button.classList.contains('theme-toggle')){
        if(sun) sun.style.display = theme === 'light' ? '' : 'none';
        if(moon) moon.style.display = theme === 'dark' ? '' : 'none';
      }
    });
  }

  function applyTheme(theme,{persist=false}={}){
    const safe = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = safe;
    syncThemeMeta(safe);
    if(persist){
      try{ localStorage.setItem(THEME_KEY,safe); }catch{}
    }
    updateThemeControls();
  }

  function toggleTheme(){
    applyTheme(activeTheme() === 'dark' ? 'light' : 'dark',{persist:true});
  }

  function makeHeaderToggle(){
    const actions = document.querySelector('.header-actions');
    if(!actions || actions.querySelector('[data-theme-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button theme-toggle';
    button.dataset.themeToggle = 'true';
    button.innerHTML = sunIcon + moonIcon;
    button.addEventListener('click',toggleTheme);
    actions.insertBefore(button,actions.firstChild);
  }

  function makeMobileToggle(){
    const sheet = document.querySelector('#mobileSheet');
    if(!sheet || sheet.querySelector('[data-theme-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sheet-action theme-sheet-toggle';
    button.dataset.themeToggle = 'true';
    button.innerHTML = `${sunIcon}${moonIcon}<span data-theme-label>Theme</span>`;
    button.addEventListener('click',toggleTheme);
    const anchor = sheet.querySelector('[data-dlavie-account-link]');
    if(anchor?.nextSibling) sheet.insertBefore(button,anchor.nextSibling);
    else sheet.appendChild(button);
  }

  function makeInlineToggle(){
    const actions = home?.querySelector('.hero-actions');
    if(!actions || home.querySelector('.home-theme-inline')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'home-theme-inline';
    button.dataset.themeToggle = 'true';
    button.innerHTML = `${sunIcon}${moonIcon}<span data-theme-label>Theme</span>`;
    button.addEventListener('click',toggleTheme);
    actions.insertAdjacentElement('afterend',button);
  }

  function refineHomeCopy(){
    if(!home || home.dataset.refined === 'true') return;
    home.dataset.refined = 'true';
    document.body.classList.add('home-refined');

    const hero = home.querySelector('.home-hero');
    const eyebrow = hero?.querySelector('.eyebrow');
    const title = hero?.querySelector('h1');
    const lede = hero?.querySelector('.hero-lede');
    const primary = hero?.querySelector('.primary-button');
    const secondary = hero?.querySelector('.secondary-button');

    if(eyebrow) eyebrow.textContent = 'DLAVIE / PROJECTS';
    if(title) title.innerHTML = 'A focused home for<br><span>what we build.</span>';
    if(lede) lede.textContent = 'Explore current releases, follow development, read what changed, and stay connected to the projects being built under DLavie.';
    if(primary){ primary.href = '#project/dlavie-shader'; primary.lastChild.textContent = 'View DLavie Shader'; }
    if(secondary){ secondary.href = '#community'; secondary.textContent = 'Open community'; }

    if(hero && !hero.querySelector('.home-meta-row')){
      const meta = document.createElement('div');
      meta.className = 'home-meta-row';
      meta.innerHTML = '<span><i></i>Minecraft Bedrock</span><span><i></i>Mobile-first</span><span><i></i>Open source</span>';
      const inlineTheme = hero.querySelector('.home-theme-inline');
      (inlineTheme || hero.querySelector('.hero-actions'))?.insertAdjacentElement('afterend',meta);
    }

    const stats = home.querySelector('.stat-strip');
    const statItems = stats ? [...stats.children] : [];
    if(statItems[0]?.querySelector('span')) statItems[0].querySelector('span').textContent = 'Active project';
    if(statItems[1]?.querySelector('span')) statItems[1].querySelector('span').textContent = 'Released versions';
    if(statItems[2]?.querySelector('span')) statItems[2].querySelector('span').textContent = 'Open-source license';

    const sections = [...home.querySelectorAll('.section-heading')];
    const featured = sections[0];
    if(featured){
      const kicker = featured.querySelector('.section-kicker');
      const heading = featured.querySelector('h2');
      const link = featured.querySelector('a');
      if(kicker) kicker.textContent = 'FEATURED PROJECT';
      if(heading) heading.textContent = 'Built for Bedrock.';
      if(link) link.textContent = 'Browse projects →';
    }

    const featuredCard = home.querySelector('.featured-project');
    const featuredDescription = featuredCard?.querySelector('.featured-copy > p');
    if(featuredDescription) featuredDescription.textContent = 'A mobile-first Vibrant Visuals + PBR shader for Minecraft Bedrock, focused on natural lighting, vanilla-faithful materials, volumetric godrays, and practical quality presets.';

    const why = sections[1];
    if(why){
      const kicker = why.querySelector('.section-kicker');
      const heading = why.querySelector('h2');
      if(kicker) kicker.textContent = 'HOW DLAVIE WORKS';
      if(heading) heading.textContent = 'Clear by design.';
    }

    const cards = [...home.querySelectorAll('.principle-grid .surface-card')];
    const copy = [
      ['Focused projects','Only projects actively developed under DLavie appear here, keeping the catalog intentional and easy to understand.'],
      ['Transparent releases','Each project keeps its description, changelog, version history, compatibility, license, and download details in one place.'],
      ['Community connected','Feedback, discussion, and roadmap voting stay close to development so the next steps remain visible.']
    ];
    cards.forEach((card,index) => {
      const item = copy[index];
      if(!item) return;
      const heading = card.querySelector('h3');
      const paragraph = card.querySelector('p');
      if(heading) heading.textContent = item[0];
      if(paragraph) paragraph.textContent = item[1];
    });
  }

  function init(){
    applyTheme(root.dataset.theme || storedTheme() || preferredTheme());
    refineHomeCopy();
    makeHeaderToggle();
    makeInlineToggle();
    makeMobileToggle();
    updateThemeControls();

    const sheet = document.querySelector('#mobileSheet');
    if(sheet){
      const observer = new MutationObserver(() => makeMobileToggle());
      observer.observe(sheet,{childList:true});
    }

    const media = matchMedia('(prefers-color-scheme: light)');
    media.addEventListener?.('change',event => {
      if(!storedTheme()) applyTheme(event.matches ? 'light' : 'dark');
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
