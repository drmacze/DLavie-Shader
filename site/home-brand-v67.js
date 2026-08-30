(() => {
  'use strict';
  const card=document.querySelector('.project-card');
  if(card&&!card.querySelector('.home-mc-brand')){
    const tags=card.querySelector('.tag-row');
    const badge='<span class="home-mc-brand"><img src="assets/icon-minecraft-block.svg?v=68" alt=""><span>Minecraft Bedrock</span></span>';
    if(tags)tags.insertAdjacentHTML('beforebegin',badge);else card.insertAdjacentHTML('beforeend',badge);
  }
  const footer=document.querySelector('.footer .wrap');
  if(footer&&!footer.querySelector('.home-brand-note')){
    footer.insertAdjacentHTML('beforeend','<span class="home-brand-note">DLavie adalah project independen dan tidak berafiliasi dengan Mojang atau Microsoft.</span>');
  }
  document.querySelectorAll('a[href*="github.com/drmacze/DLavie-Shader"]').forEach(a=>{
    if(!a.querySelector('img')){a.classList.add('home-github-link');a.insertAdjacentHTML('afterbegin','<img src="assets/icon-github.svg?v=68" alt="GitHub">')}
  });
})();
