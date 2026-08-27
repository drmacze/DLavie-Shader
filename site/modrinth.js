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
  document.head.appendChild(core);
})();
