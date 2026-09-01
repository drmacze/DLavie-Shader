(()=>{'use strict';
const ready=fn=>window.DLavie90?fn(window.DLavie90):document.addEventListener('dlavie90:ready',()=>fn(window.DLavie90),{once:true});
ready(()=>{
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const sync=()=>{const nav=$('#v100MobileNav');if(!nav)return;const h=(location.hash||'#global').slice(1);let a=document.body.classList.contains('v100-sidebar-open')?'channels':/^dm-/.test(h)||($('#c90DrawerTitle')?.textContent||'').toLowerCase()==='inbox'?'inbox':['feedback','vote','report'].includes(h)?'forum':'chat';$$('[data-v100-nav]').forEach(b=>b.classList.toggle('active',b.dataset.v100Nav===a))};
 document.addEventListener('click',e=>{const m=e.target.closest('#c90Members');if(m&&innerWidth>1180){e.preventDefault();e.stopImmediatePropagation();document.body.classList.toggle('v100-context-hidden')}},true);
 document.addEventListener('focusin',e=>{if(e.target.closest('#messageForm,#c91DmForm,.c84-composer-shell,.c91-dm-compose'))document.body.classList.add('v100-input-focus')});
 document.addEventListener('focusout',()=>setTimeout(()=>{if(!document.activeElement?.closest?.('#messageForm,#c91DmForm,.c84-composer-shell,.c91-dm-compose'))document.body.classList.remove('v100-input-focus')},80));
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('hashchange',sync);window.addEventListener('resize',sync);setTimeout(sync,100);setTimeout(sync,900);
});
})();