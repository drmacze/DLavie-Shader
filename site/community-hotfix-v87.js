(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const VIEWS=['global','help','showcase','rules','roles','feedback','vote','report'];
const CHAT=new Set(['global','help','showcase']);
const FORUM=new Set(['feedback','vote','report']);
const paths={
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  chat:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  feedback:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 8h8M8 12h6"/>',
  vote:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  report:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/>',
  home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  project:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  paperclip:'<path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01M8 14s1.5 2 4 2 4-2 4-2"/>',
  send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/>',
  flag:'<path d="M5 21V4M5 5h11l-1 4 1 4H5"/>'
};
function svg(name){return `<svg class="c87-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.chat}</svg>`}
function setIcon(el,name){if(!el)return;if(el.dataset.c87Icon===name&&el.querySelector('svg.c87-icon'))return;el.dataset.c87Icon=name;el.innerHTML=svg(name)}
function currentView(){const v=(location.hash||'#global').slice(1);return VIEWS.includes(v)?v:'global'}
function viewIcon(v){return CHAT.has(v)?'chat':v==='rules'?'check':v==='roles'?'users':v==='feedback'?'feedback':v==='vote'?'vote':'report'}
function toast(message){const el=$('#c84Toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}
function iconize(){
  setIcon($('#sidebarToggle'),'menu');
  setIcon($('#viewSymbol'),viewIcon(currentView()));
  $$('.c84-nav[data-view]').forEach(nav=>setIcon(nav.querySelector('.c84-nav-icon'),viewIcon(nav.dataset.view)));
  $$('.c84-nav[href]').forEach(nav=>{const href=nav.getAttribute('href')||'';setIcon(nav.querySelector('.c84-nav-icon'),href.includes('app.html')?'project':'home')});
  const search=$('#communitySearchToggle');if(search&&!search.dataset.c87Ready){search.dataset.c87Ready='1';search.classList.add('c87-text-icon');search.innerHTML=`${svg('search')}<span>Cari</span>`;search.setAttribute('aria-label','Cari pesan')}
  setIcon($('#fileButton'),'paperclip');setIcon($('#emojiButton'),'smile');setIcon($('#sendMessage'),'send');
  const safety=$$('.c84-safety>div b');setIcon(safety[0],'shield');setIcon(safety[1],'link');setIcon(safety[2],'flag');
}
function syncRoute(){
  const v=currentView();
  const chat=$('#chatView'),rules=$('#rulesView'),roles=$('#rolesView'),forum=$('#forumView');
  if(chat)chat.hidden=!CHAT.has(v);if(rules)rules.hidden=v!=='rules';if(roles)roles.hidden=v!=='roles';if(forum)forum.hidden=!FORUM.has(v);
  $$('[data-view]').forEach(el=>{const active=el.dataset.view===v;el.setAttribute('aria-current',active?'page':'false')});
  setIcon($('#viewSymbol'),viewIcon(v));
}
function retryCard(title,body,id){return `<div class="c87-load-card"><strong>${title}</strong><p>${body}</p><button id="${id}" type="button">Coba lagi</button></div>`}
function initLoadingGuards(){
  const boot=$('#bootState'),message=$('#messageState');let bootTimer=0,messageTimer=0;
  const armBoot=()=>{clearTimeout(bootTimer);if(!boot||boot.hidden)return;bootTimer=setTimeout(()=>{if(boot.hidden)return;boot.innerHTML=retryCard('Community belum tersambung','Koneksi ke layanan komunitas lebih lama dari biasanya. Coba muat ulang halaman.','retryCommunityBoot')},9000)};
  const armMessages=()=>{clearTimeout(messageTimer);if(!message||message.hidden||!CHAT.has(currentView()))return;const text=(message.textContent||'').toLowerCase();if(!text.includes('memuat'))return;messageTimer=setTimeout(()=>{if(message.hidden||!CHAT.has(currentView()))return;message.innerHTML=retryCard('Chat terlalu lama dimuat','Pesan belum berhasil diterima. Periksa koneksi lalu coba lagi.','retryCommunityMessages')},7000)};
  boot&&new MutationObserver(armBoot).observe(boot,{attributes:true,childList:true,subtree:true,attributeFilter:['hidden']});
  message&&new MutationObserver(armMessages).observe(message,{attributes:true,childList:true,subtree:true,attributeFilter:['hidden']});
  document.addEventListener('click',e=>{if(e.target.closest('#retryCommunityBoot,#retryCommunityMessages,#retryCommunityRules'))location.reload()});
  armBoot();armMessages();
  window.addEventListener('hashchange',()=>setTimeout(armMessages,0));
}
function initRulesGuard(){
  const list=$('#rulesList'),status=$('#rulesStatus'),agree=$('#rulesAgree'),accept=$('#acceptRules');let ruleTimer=0,busyTimer=0,original='Verifikasi & lanjut';
  const armRules=()=>{clearTimeout(ruleTimer);if(currentView()!=='rules'||!list||list.children.length)return;ruleTimer=setTimeout(()=>{if(currentView()!=='rules'||list.children.length)return;if(status){status.classList.add('c87-error');status.innerHTML='Rules belum berhasil dimuat. <button class="c84-secondary c87-inline-retry" id="retryCommunityRules" type="button">Coba lagi</button>'}},7000)};
  agree?.addEventListener('change',()=>{if(accept&&!agree.checked)accept.removeAttribute('aria-busy')});
  accept?.addEventListener('click',()=>{if(accept.disabled||!agree?.checked)return;original=accept.textContent||original;accept.setAttribute('aria-busy','true');accept.textContent='Memverifikasi…';clearTimeout(busyTimer);busyTimer=setTimeout(()=>{if(!accept.hasAttribute('aria-busy'))return;accept.removeAttribute('aria-busy');if(!/terverifikasi/i.test(status?.textContent||'')){accept.textContent=original;toast('Verifikasi belum merespons. Silakan coba lagi.')}},9000)});
  if(status)new MutationObserver(()=>{if(/sudah disetujui|terverifikasi/i.test(status.textContent||'')){clearTimeout(busyTimer);accept?.removeAttribute('aria-busy');status.classList.remove('c87-error')}}).observe(status,{childList:true,subtree:true,characterData:true});
  if(list)new MutationObserver(()=>{if(list.children.length){clearTimeout(ruleTimer);status?.classList.remove('c87-error')}}).observe(list,{childList:true});
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="rules"],#rulesCommunity'))setTimeout(armRules,0)});
  window.addEventListener('hashchange',armRules);armRules();
}
function initRouteHardening(){
  document.addEventListener('click',e=>{if(e.target.closest('[data-view],#rulesCommunity'))setTimeout(()=>{syncRoute();iconize()},0)});
  window.addEventListener('hashchange',()=>setTimeout(()=>{syncRoute();iconize()},0));
  const symbol=$('#viewSymbol');if(symbol)new MutationObserver(()=>setTimeout(()=>setIcon(symbol,viewIcon(currentView())),0)).observe(symbol,{childList:true,characterData:true,subtree:true});
  const channels=$('#channelList');if(channels)new MutationObserver(()=>setTimeout(iconize,0)).observe(channels,{childList:true,subtree:true});
  syncRoute();
}
function init(){document.body.classList.add('community-v87');iconize();initRouteHardening();initLoadingGuards();initRulesGuard()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
