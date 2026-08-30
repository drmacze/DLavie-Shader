(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const gh='<img class="brand-icon github-mark" src="assets/icon-github.svg?v=68" alt="GitHub">';
  const mc='<span class="mc-brand-row"><img src="assets/icon-minecraft-block.svg?v=68" alt=""><span>Minecraft Bedrock</span></span>';
  function githubBrand(){
    $$('.project-page a[href*="github.com/drmacze/DLavie-Shader"]').forEach(a=>{
      if(a.closest('.project-action-row')){let img=$('img',a);if(!img){a.innerHTML=gh}else{img.src='assets/icon-github.svg?v=68';img.alt='GitHub';img.className='brand-icon github-mark'}}
    });
    $$('.project-sidebar .side-links a[href*="github.com"]').forEach(a=>{const issue=/issues/.test(a.href);a.innerHTML=`${gh}<span>${issue?'Laporkan masalah':'Lihat di GitHub'}</span><b>↗</b>`});
    $$('#projectMenu a[href*="github.com"]').forEach(a=>{const issue=/issues/.test(a.href);a.innerHTML=`${gh}<span>${issue?'Laporkan masalah':'Lihat di GitHub'}</span>`});
    const copy=$('#copyPermanent');
    if(copy&&!copy.dataset.v68Bound){copy.dataset.v68Bound='1';copy.addEventListener('click',()=>navigator.clipboard?.writeText(location.href).then(()=>{const t=$('#toast');if(t){t.textContent='Link disalin';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}}).catch(()=>{}))}
  }
  function minecraftBrand(){
    const identity=$('.project-page .project-identity');
    if(identity&&!$('.mc-brand-row',identity)) identity.insertAdjacentHTML('beforeend',mc);
    const compat=$$('.project-sidebar .side-card').find(card=>/kompatibilitas/i.test($('h3',card)?.textContent||''));
    if(compat&&!$('.mc-brand-row',compat)) compat.insertAdjacentHTML('afterbegin',mc);
    if(compat&&!$('.brand-disclaimer',compat)) compat.insertAdjacentHTML('beforeend','<p class="brand-disclaimer">DLavie adalah project independen dan tidak berafiliasi dengan Mojang atau Microsoft.</p>');
  }
  function alignBrand(){
    $$('.brand-logo,.brand-icon,.round-action img,.side-links img,.official-links img').forEach(el=>{el.style.objectPosition='50% 50%';el.style.verticalAlign='middle'});
  }
  function init(){githubBrand();minecraftBrand();alignBrand()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
