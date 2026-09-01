(()=>{'use strict';
const ready=fn=>window.DLavie90?fn(window.DLavie90):document.addEventListener('dlavie90:ready',()=>fn(window.DLavie90),{once:true});
ready(()=>{
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const x='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>';
 if(!$('#v100GuardStyle')){const s=document.createElement('style');s.id='v100GuardStyle';s.textContent='.v100-sidebar-close,.v100-search-close{width:36px;height:36px;border:1px solid var(--line);border-radius:10px;background:#181e1a;color:#b8c2bb;display:grid;place-items:center;padding:0}.v100-sidebar-close svg,.v100-search-close svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.v100-sidebar-close{display:none;margin-left:auto;flex:0 0 auto}.v100-search-close{flex:0 0 auto}@media(max-width:820px){.v100-sidebar-close{display:grid}.c86-search-row{grid-template-columns:minmax(0,1fr) auto auto!important}.c86-search-meta{display:none!important}}@media(max-width:520px){.c86-search-row{grid-template-columns:minmax(0,1fr) auto auto!important}.c86-search-clear{display:none!important}}';document.head.appendChild(s)}
 const visible=el=>!!el&&!el.hidden&&getComputedStyle(el).display!=='none';
 const drawerOpen=()=>{const d=$('#c90Drawer');return !!d&&!d.hidden&&d.classList.contains('open')};
 const sheetOpen=()=>!!$('.v100-sheet.open');
 const needsScrim=()=>document.body.classList.contains('v100-sidebar-open')||document.body.classList.contains('v100-context-open')||visible($('#communitySearchPanel'))||drawerOpen()||sheetOpen();
 const sync=()=>{const nav=$('#v100MobileNav');if(nav){const h=(location.hash||'#global').slice(1);let a=document.body.classList.contains('v100-sidebar-open')?'channels':/^dm-/.test(h)||($('#c90DrawerTitle')?.textContent||'').toLowerCase()==='inbox'?'inbox':['feedback','vote','report'].includes(h)?'forum':'chat';$$('[data-v100-nav]').forEach(b=>b.classList.toggle('active',b.dataset.v100Nav===a))}};
 let reconciling=false;
 const reconcile=()=>{if(reconciling)return;reconciling=true;try{if(innerWidth<=820&&!document.body.classList.contains('v100-sidebar-open'))document.body.classList.remove('c84-menu-open');const scrim=$('#v100Scrim'),on=needsScrim();if(scrim&&scrim.hidden===on)scrim.hidden=!on;sync()}finally{reconciling=false}};
 const closeSidebarHard=()=>{document.body.classList.remove('v100-sidebar-open','c84-menu-open');$('#sidebarToggle')?.setAttribute('aria-expanded','false');reconcile()};
 const closeSearchHard=()=>{const p=$('#communitySearchPanel');if(p)p.hidden=true;$('#communitySearchToggle')?.setAttribute('aria-expanded','false');reconcile()};
 const resetTransient=()=>{document.body.classList.remove('v100-sidebar-open','v100-context-open','c84-menu-open');$('#sidebarToggle')?.setAttribute('aria-expanded','false');$$('.v100-sheet.open').forEach(s=>s.classList.remove('open'));$$('.v100-sheet').forEach(s=>s.hidden=true);const p=$('#communitySearchPanel');if(p)p.hidden=true;const d=$('#c90Drawer');if(d){d.classList.remove('open');d.hidden=true}reconcile()};
 const installCloseControls=()=>{
  const brand=$('.v100-brand');if(brand&&!$('#v100SidebarClose')){const b=document.createElement('button');b.id='v100SidebarClose';b.className='v100-sidebar-close';b.type='button';b.setAttribute('aria-label','Tutup channels');b.innerHTML=x;b.onclick=closeSidebarHard;brand.appendChild(b)}
  const row=$('.c86-search-row');if(row&&!$('#v100SearchClose')){const b=document.createElement('button');b.id='v100SearchClose';b.className='v100-search-close';b.type='button';b.setAttribute('aria-label','Tutup pencarian');b.innerHTML=x;b.onclick=closeSearchHard;row.appendChild(b)}
 };
 document.addEventListener('click',e=>{const m=e.target.closest('#c90Members');if(m&&innerWidth>1180){e.preventDefault();e.stopImmediatePropagation();document.body.classList.toggle('v100-context-hidden')}queueMicrotask(reconcile)},true);
 document.addEventListener('focusin',e=>{if(e.target.closest('#messageForm,#c91DmForm,.c84-composer-shell,.c91-dm-compose'))document.body.classList.add('v100-input-focus')});
 document.addEventListener('focusout',()=>setTimeout(()=>{if(!document.activeElement?.closest?.('#messageForm,#c91DmForm,.c84-composer-shell,.c91-dm-compose'))document.body.classList.remove('v100-input-focus')},80));
 new MutationObserver(()=>queueMicrotask(reconcile)).observe(document.body,{attributes:true,attributeFilter:['class']});
 const observeSurfaces=()=>{for(const el of [$('#v100Scrim'),$('#communitySearchPanel'),$('#c90Drawer'),...$$('.v100-sheet')])if(el&&!el.dataset.v103Observed){el.dataset.v103Observed='1';new MutationObserver(()=>queueMicrotask(reconcile)).observe(el,{attributes:true,attributeFilter:['hidden','class']})}};
 window.addEventListener('hashchange',()=>{closeSidebarHard();reconcile()});
 window.addEventListener('resize',reconcile);
 window.addEventListener('pageshow',()=>{resetTransient();installCloseControls();observeSurfaces()});
 installCloseControls();observeSurfaces();resetTransient();
 setTimeout(()=>{installCloseControls();observeSurfaces();reconcile()},120);
 setTimeout(()=>{installCloseControls();observeSurfaces();reconcile()},900);
});
})();