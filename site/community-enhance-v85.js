(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function init(){
  document.body.classList.add('community-v85');
  $('#sidebarToggle')?.addEventListener('click',()=>document.body.classList.toggle('c84-menu-open'));
  $('#sidebarScrim')?.addEventListener('click',()=>document.body.classList.remove('c84-menu-open'));
  $$('[data-view]').forEach(el=>el.addEventListener('click',()=>{if(innerWidth<=720)document.body.classList.remove('c84-menu-open')}));
  const head=$('.c84-head');
  if(head&&!$('#communitySearchButton')){
    const b=document.createElement('button');b.id='communitySearchButton';b.className='c84-head-action';b.type='button';b.textContent='Cari';head.insertBefore(b,$('.c84-head-action',head));
    b.onclick=()=>{
      const q=prompt('Cari pesan di channel ini');if(!q)return;const term=q.toLowerCase();let found=0;
      $$('.c84-message').forEach(m=>{const ok=m.textContent.toLowerCase().includes(term);m.style.display=ok?'':'none';if(ok)found++});
      const t=$('#c84Toast');if(t){t.textContent=found?`${found} pesan ditemukan.`:'Pesan tidak ditemukan.';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
    };
  }
  const welcome=$('.c84-welcome p');if(welcome)welcome.innerHTML='Chat publik DLavie. <b>Link eksternal diblokir dari server.</b> Kamu bisa mengirim foto, file, membalas pesan, reaction, dan report.';
  const server=$('.c84-server');if(server&&!server.querySelector('.c85-server-meta'))server.insertAdjacentHTML('beforeend','<div class="c85-server-meta" style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap"><span style="font-size:7.5px;border:1px solid #35513c;padding:4px 6px;border-radius:5px;color:#8ee3a5">PUBLIC CHAT</span><span style="font-size:7.5px;border:1px solid #35513c;padding:4px 6px;border-radius:5px;color:#8ee3a5">VERIFIED</span><span style="font-size:7.5px;border:1px solid #35513c;padding:4px 6px;border-radius:5px;color:#8ee3a5">SAFE LINKS</span></div>');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();