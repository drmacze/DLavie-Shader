(() => {
  'use strict';

  const isCommunityRoute = () => {
    const hash = (location.hash || '').replace(/^#\/?/, '').toLowerCase();
    return hash === 'community' || hash.startsWith('community?') || hash.startsWith('community/');
  };

  const openCommunity = () => {
    const target = new URL('community.html', location.href);
    location.replace(target.href);
  };

  const injectAccountLinks = () => {
    const actions = document.querySelector('.header-actions');
    if (actions && !actions.querySelector('[data-dlavie-account-link]')) {
      const link = document.createElement('a');
      link.className = 'quiet-button';
      link.href = 'account.html';
      link.dataset.dlavieAccountLink = 'true';
      link.textContent = 'Account';
      actions.appendChild(link);
    }

    const sheet = document.querySelector('#mobileSheet');
    if (sheet && !sheet.querySelector('[data-dlavie-account-link]')) {
      const link = document.createElement('a');
      link.className = 'sheet-action';
      link.href = 'account.html';
      link.dataset.dlavieAccountLink = 'true';
      link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>Account';
      sheet.insertBefore(link, sheet.firstElementChild?.nextElementSibling || null);
    }
  };

  if (isCommunityRoute()) {
    openCommunity();
    return;
  }

  window.addEventListener('hashchange', () => {
    if (isCommunityRoute()) openCommunity();
  }, { passive: true });

  const core = document.createElement('script');
  core.src = 'modrinth-core.js';
  core.defer = true;
  core.onload = () => {
    injectAccountLinks();
    const observer = new MutationObserver(injectAccountLinks);
    observer.observe(document.body, { childList: true, subtree: true });
  };
  document.head.appendChild(core);
})();
