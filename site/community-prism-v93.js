(()=>{'use strict';
const ready=fn=>window.DLavie90?fn(window.DLavie90):document.addEventListener('dlavie90:ready',()=>fn(window.DLavie90),{once:true});
ready(D=>{const {$,$$}=D;document.body.classList.add('community-v93');
const paths={
 hub:'<path d="m12 2 7.5 4.3v8.6L12 22l-7.5-7.1V6.3z"/><path class="accent" d="m8.4 12 2.2 2.2 5-5"/><circle class="fill-accent" cx="17.7" cy="6.6" r="1.2"/>',
 community:'<path d="M5 7.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 3v-12a2 2 0 0 1 1-2z"/><path class="accent" d="M8 12h8M8 15h5"/>',
 inbox:'<path d="M4 5h16v13H4z"/><path d="M4 13h4l2 3h4l2-3h4"/><path class="accent" d="M12 3v6m0 0 2-2m-2 2-2-2"/>',
 forum:'<path d="M5 4h14v12H9l-4 4z"/><path class="accent" d="M8 8h8M8 11h6"/>',
 settings:'<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/><path d="M19 12a7 7 0 0 0-.12-1.28l2-1.55-2-3.46-2.46 1a7.2 7.2 0 0 0-2.2-1.28L13.86 3h-4l-.36 2.43a7.2 7.2 0 0 0-2.2 1.28l-2.46-1-2 3.46 2 1.55A7 7 0 0 0 4.72 12c0 .44.04.87.12 1.28l-2 1.55 2 3.46 2.46-1a7.2 7.2 0 0 0 2.2 1.28L9.86 21h4l.36-2.43a7.2 7.2 0 0 0 2.2-1.28l2.46 1 2-3.46-2-1.55c.08-.41.12-.84.12-1.28z"/>',
 shield:'<path d="M12 3 20 6v5.5c0 5-3.2 8.2-8 10-4.8-1.8-8-5-8-10V6z"/><path class="accent" d="m8.6 12 2.1 2.1 4.8-4.8"/>',
 roles:'<path d="M7 4h10l3 5-8 11L4 9z"/><path class="accent" d="m8 9 4-5 4 5-4 4z"/>',
 feedback:'<path d="M5 5h14v11H9l-4 4z"/><path class="accent" d="M8 9h8M8 12h5"/>',
 poll:'<path d="M5 20V10m7 10V4m7 16v-7"/><path class="accent" d="M3 20h18"/>',
 report:'<path d="M6 21V4m0 1h11l-2 4 2 4H6"/><circle class="fill-accent" cx="6" cy="4" r="1.2"/>',
 home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
 project:'<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path class="accent" d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
 channel:'<path d="M9 3 7 21m10-18-2 18M4 9h16M3 15h16"/><circle class="fill-accent" cx="18.5" cy="5.5" r="1.25"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21M12 3C9.5 5.7 8.2 8.7 8.2 12S9.5 18.3 12 21"/>',
 help:'<path d="M9.7 9a2.5 2.5 0 1 1 4.1 1.9c-1.1.8-1.8 1.3-1.8 2.6"/><circle class="fill-accent" cx="12" cy="17" r="1.2"/><circle cx="12" cy="12" r="9"/>',
 gallery:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.5"/><path class="accent" d="m5 17 4.5-4 3.2 2.7 2.4-2.1L19 17"/>',
 search:'<circle cx="10.8" cy="10.8" r="6.8"/><path class="accent" d="m16 16 4 4"/>',
 pin:'<path d="m9 4 6 6m-1-7 7 7-3 2-4 4-2 3-7-7 3-2 4-4z"/><path class="accent" d="m4 20 6-6"/>',
 users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.4"/><path class="accent" d="M16 14.5c3 0 4.8 1.8 4.8 4.5"/>',
 bell:'<path d="M6 16h12l-1.6-2.1V10a4.4 4.4 0 0 0-8.8 0v3.9z"/><path class="accent" d="M10 19h4"/>',
 status:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.1 2.1 1.7 3.5 1.7s2.5-.6 3.5-1.7"/><circle class="fill-accent" cx="9" cy="10" r="1"/><circle class="fill-accent" cx="15" cy="10" r="1"/>',
 paperclip:'<path d="m8.5 12.5 6.8-6.8a3 3 0 1 1 4.2 4.2l-8.2 8.2a5 5 0 0 1-7.1-7.1l8-8"/><path class="accent" d="m8 15 7.8-7.8"/>',
 smile:'<circle cx="12" cy="12" r="9"/><path class="accent" d="M8.5 14.5c1 1.1 2.1 1.7 3.5 1.7s2.5-.6 3.5-1.7"/><path d="M9 9h.01M15 9h.01"/>',
 send:'<path d="m3 4 18 8-18 8 3.2-8z"/><path class="accent" d="M6.2 12H17"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h10"/><circle class="fill-accent" cx="18" cy="18" r="1.3"/>',
 account:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/><circle class="fill-accent" cx="18.5" cy="5.5" r="1.2"/>',
 plus:'<path d="M12 5v14M5 12h14"/><circle class="accent" cx="12" cy="12" r="9"/>',
 close:'<path d="m7 7 10 10M17 7 7 17"/>',
 more:'<circle cx="5" cy="12" r="1.2"/><circle class="fill-accent" cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'
};
const icon=n=>`<svg class="c93-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[n]||paths.channel}</svg>`;
function navIconFor(nav){if(nav.id==='communityAdminNav')return'settings';const v=nav.dataset.view||'';if(v==='rules')return'shield';if(v==='roles')return'roles';if(v==='feedback')return'feedback';if(v==='vote')return'poll';if(v==='report')return'report';if(v==='global')return'globe';if(v==='help')return'help';if(v==='showcase')return'gallery';const href=nav.getAttribute('href')||'';if(/index\.html/.test(href))return'home';if(/app\.html/.test(href))return'project';if(nav.classList.contains('c90-channel'))return'channel';return'channel'}
function iconizeNav(){for(const nav of $$('.c84-nav')){const slot=nav.querySelector('.c84-nav-icon');if(!slot)continue;const n=navIconFor(nav);if(slot.dataset.c93Icon===n)continue;slot.dataset.c93Icon=n;slot.innerHTML=icon(n)}}
function iconButton(el,name,label,showLabel=false){if(!el)return;el.setAttribute('aria-label',label);el.classList.add('c93-tip');el.dataset.c92Tip=label;const key=`${name}:${showLabel}`;if(el.dataset.c93Button===key)return;el.dataset.c93Button=key;el.innerHTML=`${icon(name)}${showLabel?`<span class="c93-control-label">${label}</span>`:''}`}
function iconizeControls(){iconButton($('#sidebarToggle'),'menu','Channel');iconButton($('#communitySearchToggle'),'search','Cari',true);iconButton($('#c90Pins'),'pin','Pinned');iconButton($('#c90Members'),'users','Member');iconButton($('#c90Notify'),'bell','Notifikasi');iconButton($('#c91Inbox'),'inbox','Inbox',true);iconButton($('#c91Status'),'status','Status',true);iconButton($('#fileButton'),'paperclip','Lampirkan file');iconButton($('#emojiButton'),'smile','Emoji');iconButton($('#sendMessage'),'send','Kirim');const rules=$('.c84-head [data-view="rules"]');iconButton(rules,'shield','Rules',true);const add=$('#c91NewDm');if(add)iconButton(add,'plus','Direct Message baru');for(const b of $$('.c91-more')){if(!b.dataset.c93Button){b.dataset.c93Button='more';b.innerHTML=icon('more')}}for(const x of $$('[data-close-modal]')){if(!x.dataset.c93Close){x.dataset.c93Close='1';x.innerHTML=icon('close')}}}
function iconizeSafety(){const rows=$$('.c84-safety>div');const names=['shield','inbox','report'];rows.forEach((r,i)=>{const b=r.querySelector(':scope>b');if(b&&!b.dataset.c93Safety){b.dataset.c93Safety='1';b.innerHTML=icon(names[i]||'shield')}})}
function iconizeWelcome(){const w=$('.c84-welcome-icon');if(w&&!w.dataset.c93Welcome){w.dataset.c93Welcome='1';w.innerHTML=icon('channel')}}
function iconizeDock(){const dock=$('#c92MobileDock');if(!dock)return;const map={channels:['community','Channel'],inbox:['inbox','Inbox'],search:['search','Cari'],members:['users','Member'],account:['account','Akun']};for(const b of $$('[data-c92-dock]',dock)){const x=map[b.dataset.c92Dock];if(!x||b.dataset.c93Dock)return;b.dataset.c93Dock='1';b.innerHTML=`${icon(x[0])}<span>${x[1]}</span>`}}
function installRail(){const body=$('.c84-body');if(!body||$('#c93Rail'))return;const rail=document.createElement('nav');rail.id='c93Rail';rail.className='c93-rail';rail.setAttribute('aria-label','DLavie workspace');rail.innerHTML=`<button class="c93-rail-mark" type="button" data-c93-action="community" aria-label="DLavie Community">${icon('hub')}</button><div class="c93-rail-sep"></div><button class="c93-rail-btn" type="button" data-c93-action="community" aria-label="Community">${icon('community')}<span class="c93-rail-label">Community</span></button><button class="c93-rail-btn" type="button" data-c93-action="inbox" aria-label="Inbox">${icon('inbox')}<span class="c93-rail-label">Inbox</span></button><button class="c93-rail-btn" type="button" data-c93-action="forum" aria-label="Forum">${icon('forum')}<span class="c93-rail-label">Forum</span></button><div class="c93-rail-spacer"></div><button class="c93-rail-btn" type="button" data-c93-action="settings" aria-label="Community Settings">${icon('settings')}<span class="c93-rail-label">Settings</span></button>`;body.prepend(rail)}
function railAction(a){if(a==='community')document.querySelector('[data-view="global"]')?.click();else if(a==='inbox')$('#c91Inbox')?.click();else if(a==='forum')document.querySelector('[data-view="feedback"]')?.click();else if(a==='settings')$('#communityAdminNav')?.click()}
function syncRail(){const h=location.hash||'#global',settings=$('[data-c93-action="settings"]');if(settings)settings.hidden=!$('#communityAdminNav');let active='community';if(/^#dm-/.test(h))active='inbox';else if(/^#(feedback|vote|report)/.test(h))active='forum';else if(h==='#settings')active='settings';$$('[data-c93-action]','#c93Rail').forEach(b=>b.classList.toggle('active',b.dataset.c93Action===active&&b.classList.contains('c93-rail-btn')))}
function iconForView(){const h=(location.hash||'#global').slice(1),title=($('#viewTitle')?.textContent||'').toLowerCase();if(h==='settings'||/settings|console/.test(title))return'settings';if(h==='rules')return'shield';if(h==='roles')return'roles';if(h==='feedback')return'feedback';if(h==='vote')return'poll';if(h==='report')return'report';if(/^dm-/.test(h))return'inbox';if(h==='global')return'globe';if(h==='help')return'help';if(h==='showcase')return'gallery';return'channel'}
function syncHeader(){const s=$('#viewSymbol');if(s){const n=iconForView();if(s.dataset.c93View!==n){s.dataset.c93View=n;s.innerHTML=icon(n)}}syncRail()}
function refresh(){iconizeNav();iconizeControls();iconizeSafety();iconizeWelcome();iconizeDock();syncHeader()}
function bind(){document.addEventListener('click',e=>{const r=e.target.closest('[data-c93-action]');if(r){e.preventDefault();railAction(r.dataset.c93Action)}setTimeout(refresh,30)},true);window.addEventListener('hashchange',()=>setTimeout(refresh,20));window.addEventListener('popstate',()=>setTimeout(refresh,20));const title=$('#viewTitle'),sidebar=$('#sidebar'),head=$('.c84-head'),dock=$('#c92MobileDock'),messages=$('#messageList');if(title)new MutationObserver(()=>setTimeout(syncHeader,10)).observe(title,{subtree:true,childList:true,characterData:true});if(sidebar)new MutationObserver(()=>setTimeout(refresh,20)).observe(sidebar,{subtree:true,childList:true});if(head)new MutationObserver(()=>setTimeout(iconizeControls,20)).observe(head,{subtree:true,childList:true});if(dock)new MutationObserver(()=>setTimeout(iconizeDock,10)).observe(dock,{subtree:true,childList:true});if(messages)new MutationObserver(()=>setTimeout(iconizeControls,20)).observe(messages,{subtree:true,childList:true});setInterval(()=>{iconizeNav();iconizeControls();syncRail()},5000)}
function init(){installRail();refresh();bind();setTimeout(refresh,250);setTimeout(refresh,900)}
init();
});
})();
