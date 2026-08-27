(() => {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    .message-name,.message-reply{appearance:none;-webkit-appearance:none;border:0;background:transparent;padding:0;color:inherit;font:inherit;text-align:left}
    .message-name{cursor:pointer;font-weight:800}
    .message-reply{cursor:pointer;max-width:100%}
    .message.deleted-message{opacity:.66}
    .message.deleted-message .message-body{color:var(--dim);font-style:italic}
    .message.deleted-message .message-actions,.message.deleted-message .reaction-row{display:none!important}
    .message.deleted-message .message-avatar{filter:saturate(.35)}
    .mobile-sidebar-toggle{display:none;width:36px;height:36px;border:1px solid var(--line);background:var(--surface);border-radius:11px;place-items:center;cursor:pointer;flex:0 0 auto}
    .mobile-sidebar-toggle svg{width:19px;height:19px}
    @media(max-width:760px){
      .chat-header:before{display:none!important}
      .mobile-sidebar-toggle{display:grid}
    }
  `;
  document.head.appendChild(style);

  function markDeletedMessages(root=document){
    root.querySelectorAll?.('.message').forEach(message => {
      const body = message.querySelector('.message-body')?.textContent?.trim() || '';
      const deleted = body === '[message deleted]' || body === '[message removed by moderator]';
      message.classList.toggle('deleted-message', deleted);
      if(deleted){
        message.querySelectorAll('[data-reply],[data-react],[data-react-open],[data-more]').forEach(el => {
          el.disabled = true;
          el.removeAttribute('data-reply');
          el.removeAttribute('data-react');
          el.removeAttribute('data-react-open');
          el.removeAttribute('data-more');
        });
      }
    });
  }

  function installObserver(){
    const list = document.querySelector('#messageList');
    if(!list) return;
    markDeletedMessages(list);
    const observer = new MutationObserver(() => markDeletedMessages(list));
    observer.observe(list,{childList:true,subtree:true,characterData:true});
  }

  function installMobileSidebarButton(){
    const header = document.querySelector('.chat-header');
    const sidebar = document.querySelector('#communitySidebar');
    const info = document.querySelector('#communityInfo');
    const backdrop = document.querySelector('#mobileInfoBackdrop');
    if(!header || !sidebar || !backdrop || header.querySelector('.mobile-sidebar-toggle')) return;
    const button = document.createElement('button');
    button.type='button';
    button.className='mobile-sidebar-toggle';
    button.setAttribute('aria-label','Open community navigation');
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    button.addEventListener('click', e => {
      e.stopPropagation();
      sidebar.classList.add('open');
      info?.classList.remove('open');
      backdrop.hidden=false;
    });
    header.insertBefore(button,header.firstChild);
  }

  function init(){
    installObserver();
    installMobileSidebarButton();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
