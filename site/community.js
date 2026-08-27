(() => {
  'use strict';
  const core = document.createElement('script');
  core.src = 'community-core.js';
  core.onload = () => {
    const patch = document.createElement('script');
    patch.src = 'community-patch.js';
    document.head.appendChild(patch);
  };
  document.head.appendChild(core);
})();
