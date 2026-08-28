(() => {
  'use strict';

  const setTextPreserveIcon = (el,text) => {
    if(!el) return;
    const icon = el.querySelector('svg')?.outerHTML || el.querySelector('img')?.outerHTML || '';
    el.innerHTML = icon + text;
  };

  function localizeSearch(){
    const input = document.querySelector('#globalSearch');
    if(input){
      input.placeholder = 'Cari project, versi, changelog…';
      input.setAttribute('aria-label','Cari di DLavie');
    }
    const close = document.querySelector('#searchClose');
    if(close) close.setAttribute('aria-label','Tutup pencarian');

    const results = document.querySelector('#searchResults');
    if(!results) return;

    const translate = () => {
      results.querySelectorAll('p').forEach(p => {
        const text = p.textContent.trim();
        if(text.startsWith('Try “shader”')) p.textContent = 'Cari shader, versi, changelog, atau feedback.';
        if(text === 'No results.') p.textContent = 'Tidak ada hasil yang cocok.';
      });
      results.querySelectorAll('a span').forEach(span => {
        const map = {
          'Project':'Project',
          'Development':'Update',
          'Issues & feedback':'Issue & feedback',
          'Send an issue':'Kirim issue',
          'Shader roadmap':'Roadmap shader'
        };
        if(map[span.textContent.trim()]) span.textContent = map[span.textContent.trim()];
      });
    };
    translate();
    new MutationObserver(translate).observe(results,{childList:true,subtree:true,characterData:true});
  }

  function localizeSheet(){
    const sheet = document.querySelector('#mobileSheet');
    if(!sheet) return;

    const translate = () => {
      sheet.querySelectorAll('[data-dlavie-account-link]').forEach(link => {
        const raw = link.textContent.trim().toLowerCase();
        if(raw === 'account') setTextPreserveIcon(link,'Akun');
        if(raw === 'sign in') setTextPreserveIcon(link,'Masuk');
      });
      const themeLabel = sheet.querySelector('[data-theme-label]');
      if(themeLabel){
        const light = document.documentElement.dataset.theme !== 'light';
        themeLabel.textContent = light ? 'Tema terang' : 'Tema gelap';
      }
    };

    translate();
    new MutationObserver(translate).observe(sheet,{childList:true,subtree:true,characterData:true});
  }

  function improveOverlayBehavior(){
    const search = document.querySelector('#searchOverlay');
    const sheet = document.querySelector('#mobileSheet');

    window.addEventListener('keydown',event => {
      if(event.key !== 'Escape') return;
      if(search && !search.hidden) document.querySelector('#searchClose')?.click();
      if(sheet?.classList.contains('open')) document.querySelector('#sheetBackdrop')?.click();
    });

    document.querySelector('#mobileMenuOpen')?.setAttribute('aria-label','Buka menu');
    document.querySelector('#mobileSearch')?.setAttribute('aria-label','Buka pencarian');
  }

  function init(){
    localizeSearch();
    localizeSheet();
    improveOverlayBehavior();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
