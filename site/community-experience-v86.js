(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const DRAFT_PREFIX='dlavie.community.draft.';
let userScrollTop=0,userNearBottom=true,preserveScroll=false;
let forumOrderSeed=0,forumReordering=false;
function toast(message){const el=$('#c84Toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
function chatView(){return ['global','help','showcase'].includes((location.hash||'#global').slice(1))}
function updateNavState(){const view=(location.hash||'#global').slice(1);$$('[data-view]').forEach(el=>{const on=el.dataset.view===view;el.setAttribute('aria-current',on?'page':'false')});const toggle=$('#sidebarToggle');if(toggle)toggle.setAttribute('aria-expanded',document.body.classList.contains('c84-menu-open')?'true':'false')}
function initSearch(){const toggle=$('#communitySearchToggle'),panel=$('#communitySearchPanel'),input=$('#communitySearchInput'),meta=$('#communitySearchMeta'),clear=$('#communitySearchClear'),empty=$('#communitySearchEmpty');if(!toggle||!panel||!input)return;
  const reset=()=>{input.value='';$$('.c84-message').forEach(m=>m.hidden=false);if(meta)meta.textContent='Semua pesan';if(empty)empty.hidden=true};
  const close=()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false');reset()};
  const open=()=>{if(!chatView()){toast('Pencarian pesan tersedia di channel chat.');return}panel.hidden=false;toggle.setAttribute('aria-expanded','true');setTimeout(()=>input.focus(),0)};
  const apply=()=>{const q=input.value.trim().toLocaleLowerCase('id-ID'),messages=$$('.c84-message');let hits=0;messages.forEach(m=>{const show=!q||m.textContent.toLocaleLowerCase('id-ID').includes(q);m.hidden=!show;if(show)hits++});if(meta)meta.textContent=q?`${hits} dari ${messages.length} pesan`:`${messages.length} pesan`;if(empty)empty.hidden=!q||hits>0};
  toggle.addEventListener('click',()=>panel.hidden?open():close());input.addEventListener('input',apply);clear?.addEventListener('click',()=>{reset();input.focus()});
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();panel.hidden?open():close()}else if(e.key==='/'&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!/input|textarea|select/i.test(document.activeElement?.tagName||'')){e.preventDefault();open()}else if(e.key==='Escape'&&!panel.hidden){close()}});
  window.addEventListener('hashchange',()=>{close();setTimeout(()=>{if(meta)meta.textContent=`${$$('.c84-message').length} pesan`},120)});
  const list=$('#messageList');if(list)new MutationObserver(()=>{if(panel.hidden||!input.value){if(meta)meta.textContent=`${$$('.c84-message').length} pesan`;return}apply()}).observe(list,{childList:true});
}
function draftKey(){const v=(location.hash||'#global').slice(1);return `${DRAFT_PREFIX}${['global','help','showcase'].includes(v)?v:'global'}`}
function initComposer(){const input=$('#messageInput'),counter=$('#messageCounter'),form=$('#messageForm'),emojiButton=$('#emojiButton'),emojiTray=$('#emojiTray');if(!input)return;let lastValue=input.value;
  const grow=()=>{input.style.height='auto';input.style.height=`${Math.min(160,Math.max(32,input.scrollHeight))}px`};
  const count=()=>{const n=input.value.length;if(counter){counter.textContent=`${n}/1200`;counter.classList.toggle('warn',n>=1000&&n<1200);counter.classList.toggle('limit',n>=1200)}};
  const save=()=>{try{const value=input.value;if(value)localStorage.setItem(draftKey(),value);else localStorage.removeItem(draftKey())}catch{}};
  const sync=()=>{lastValue=input.value;grow();count();save()};
  const restore=()=>{try{const value=localStorage.getItem(draftKey())||'';if(!input.value&&value)input.value=value}catch{}lastValue=input.value;grow();count()};
  input.addEventListener('input',sync);input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&matchMedia('(pointer:fine)').matches){e.preventDefault();if(input.value.trim()||!$('#fileStrip')?.hidden)form?.requestSubmit()}});
  setInterval(()=>{if(input.value!==lastValue)sync()},500);
  const emojis=['😀','😂','😍','🔥','✨','👍','❤️','🎉','🙏','😎','🤝','✅','👀','💡','🚀','🎮','⛏️','🌿'];
  if(emojiTray){emojiTray.innerHTML=emojis.map(x=>`<button type="button" data-c86-emoji="${x}" aria-label="Emoji ${x}">${x}</button>`).join('');emojiTray.addEventListener('click',e=>{const b=e.target.closest('[data-c86-emoji]');if(!b)return;const start=input.selectionStart??input.value.length,end=input.selectionEnd??start,emoji=b.dataset.c86Emoji;input.setRangeText(emoji,start,end,'end');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();emojiTray.hidden=true;emojiButton?.setAttribute('aria-expanded','false')})}
  emojiButton?.addEventListener('click',()=>{if(!emojiTray)return;emojiTray.hidden=!emojiTray.hidden;emojiButton.setAttribute('aria-expanded',emojiTray.hidden?'false':'true')});
  document.addEventListener('click',e=>{if(emojiTray&&!emojiTray.hidden&&!emojiTray.contains(e.target)&&e.target!==emojiButton){emojiTray.hidden=true;emojiButton?.setAttribute('aria-expanded','false')}});
  window.addEventListener('hashchange',()=>setTimeout(restore,100));restore();
}
function initReplyStrip(){const strip=$('#replyStrip'),clear=$('#clearReply');if(!strip||!clear)return;const sync=()=>{clear.hidden=strip.hidden};new MutationObserver(sync).observe(strip,{attributes:true,attributeFilter:['hidden']});sync()}
function initScrollPreservation(){const scroller=$('#messageScroller'),list=$('#messageList'),jump=$('#jumpToLatest');if(!scroller||!list||!jump)return;
  const near=()=>scroller.scrollHeight-scroller.scrollTop-scroller.clientHeight<90;
  userScrollTop=scroller.scrollTop;userNearBottom=near();
  scroller.addEventListener('scroll',()=>{if(preserveScroll)return;userScrollTop=scroller.scrollTop;userNearBottom=near();if(userNearBottom)jump.hidden=true},{passive:true});
  new MutationObserver(()=>{const keepTop=userScrollTop,wasNear=userNearBottom;if(wasNear){requestAnimationFrame(()=>{jump.hidden=true});return}preserveScroll=true;requestAnimationFrame(()=>{scroller.scrollTop=keepTop;jump.hidden=false;requestAnimationFrame(()=>{preserveScroll=false;userScrollTop=scroller.scrollTop;userNearBottom=near()})})}).observe(list,{childList:true});
  jump.addEventListener('click',()=>{preserveScroll=false;scroller.scrollTo({top:scroller.scrollHeight,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});jump.hidden=true;userNearBottom=true});
  window.addEventListener('hashchange',()=>{jump.hidden=true;userNearBottom=true;userScrollTop=0});
}
function postScore(post){const up=post.querySelector('[data-forum-upvote]');if(up){const m=up.textContent.match(/(\d+)/);return Number(m?.[1]||0)}return $$('.c84-option strong',post).reduce((n,el)=>{const m=el.textContent.match(/·\s*(\d+)/);return n+Number(m?.[1]||0)},0)}
function initForumTools(){const list=$('#forumList'),search=$('#forumSearchInput'),sort=$('#forumSort'),empty=$('#forumEmpty');if(!list||!search||!sort)return;
  const stamp=()=>{$$('.c84-post',list).forEach(p=>{if(!p.dataset.c86Order)p.dataset.c86Order=String(++forumOrderSeed)})};
  const apply=()=>{stamp();const q=search.value.trim().toLocaleLowerCase('id-ID'),posts=$$('.c84-post',list);posts.forEach(p=>p.hidden=!!q&&!p.textContent.toLocaleLowerCase('id-ID').includes(q));const ordered=sort.value==='popular'?posts.sort((a,b)=>postScore(b)-postScore(a)||Number(a.dataset.c86Order)-Number(b.dataset.c86Order)):posts.sort((a,b)=>Number(a.dataset.c86Order)-Number(b.dataset.c86Order));forumReordering=true;ordered.forEach(p=>list.appendChild(p));setTimeout(()=>{forumReordering=false},0);const visible=posts.filter(p=>!p.hidden).length;if(empty)empty.hidden=!q||visible>0};
  search.addEventListener('input',apply);sort.addEventListener('change',apply);window.addEventListener('hashchange',()=>{search.value='';sort.value='latest';forumOrderSeed=0;if(empty)empty.hidden=true});
  new MutationObserver(()=>{if(forumReordering)return;if($$('.c84-post',list).length){stamp();if(search.value||sort.value!=='latest')apply()}}).observe(list,{childList:true});
}
function addCounter(field,max){if(!field||field.parentElement?.querySelector('.c86-counter'))return;const out=document.createElement('small');out.className='c86-counter';const sync=()=>{const n=field.value.length;out.textContent=`${n}/${max}`;out.classList.toggle('warn',n>=Math.round(max*.85))};field.addEventListener('input',sync);field.insertAdjacentElement('afterend',out);sync()}
function initForumValidation(){const form=$('#forumForm'),kind=$('#forumKind'),title=$('#forumPostTitle'),body=$('#forumPostBody'),options=$('#forumOptions');if(!form)return;let error=$('#forumFormError');if(!error){error=document.createElement('div');error.id='forumFormError';error.className='c86-form-error';error.hidden=true;form.insertBefore(error,form.querySelector('.c84-primary'))}
  addCounter(title,120);addCounter(body,4000);addCounter(options,700);
  form.addEventListener('submit',e=>{error.hidden=true;if(kind?.value==='vote'){const rows=(options?.value||'').split('\n').map(x=>x.trim()).filter(Boolean);if(rows.length<2||rows.length>6){e.preventDefault();e.stopImmediatePropagation();error.textContent='Voting harus memiliki 2–6 pilihan yang tidak kosong.';error.hidden=false;options?.focus();return}if(new Set(rows.map(x=>x.toLocaleLowerCase('id-ID'))).size!==rows.length){e.preventDefault();e.stopImmediatePropagation();error.textContent='Pilihan voting tidak boleh duplikat.';error.hidden=false;options?.focus()}}},true);
  $('#createForum')?.addEventListener('click',()=>setTimeout(()=>{error.hidden=true;title?.focus()},0));
}
function initLightbox(){const lightbox=$('#imageLightbox'),img=$('#lightboxImage'),close=$('#lightboxClose');if(!lightbox||!img)return;const hide=()=>{lightbox.hidden=true;img.removeAttribute('src');document.body.style.removeProperty('overflow')};document.addEventListener('click',e=>{const image=e.target.closest('.c84-image');if(!image)return;e.preventDefault();img.src=image.currentSrc||image.src;img.alt=image.alt||'Community image';lightbox.hidden=false;document.body.style.overflow='hidden'});close?.addEventListener('click',hide);lightbox.addEventListener('click',e=>{if(e.target===lightbox)hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden)hide()})}
function initModalsAndMobile(){const toggle=$('#sidebarToggle');toggle?.addEventListener('click',()=>setTimeout(updateNavState,0));$('#sidebarScrim')?.addEventListener('click',()=>setTimeout(updateNavState,0));$$('[data-view]').forEach(el=>el.addEventListener('click',()=>setTimeout(updateNavState,0)));document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;document.body.classList.remove('c84-menu-open');$$('.c84-modal-backdrop').forEach(m=>m.hidden=true);const tray=$('#emojiTray');if(tray)tray.hidden=true;updateNavState()});$$('.c84-modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.hidden=true}));window.addEventListener('hashchange',()=>setTimeout(updateNavState,0));updateNavState()}
function initNetworkFeedback(){window.addEventListener('offline',()=>toast('Koneksi terputus. Pesan baru mungkin tertunda.'));window.addEventListener('online',()=>toast('Koneksi kembali online.'))}
function init(){document.body.classList.add('community-v86');initSearch();initComposer();initReplyStrip();initScrollPreservation();initForumTools();initForumValidation();initLightbox();initModalsAndMobile();initNetworkFeedback()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
