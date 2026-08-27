(() => {
  'use strict';
  const valid = new Set(['profile','security','preferences','data']);
  const $all = (s,r=document) => [...r.querySelectorAll(s)];

  function activeSectionFromHash(){
    const raw = location.hash.replace(/^#/, '').toLowerCase();
    return valid.has(raw) ? raw : 'profile';
  }

  function applySection(name, {updateUrl=false} = {}){
    if(!valid.has(name)) name = 'profile';
    $all('[data-panel]').forEach(button => {
      const active = button.dataset.panel === name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    $all('[data-account-panel]').forEach(panel => {
      const active = panel.dataset.accountPanel === name;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if(updateUrl && location.hash !== `#${name}`){
      history.pushState({accountSection:name}, '', `${location.pathname}${location.search}#${name}`);
    }
    const activePanel = document.querySelector(`[data-account-panel="${name}"]`);
    if(activePanel && !document.querySelector('#accountView')?.hidden){
      const heading = activePanel.querySelector('h2');
      if(heading) document.title = `${heading.textContent} — DLavie Account`;
    }
  }

  function ensureSingleAuthForm(){
    const forms = ['loginForm','registerForm','resetRequestForm','resetPasswordForm']
      .map(id => document.getElementById(id)).filter(Boolean);
    const visible = forms.filter(form => !form.hidden);
    if(visible.length <= 1) return;
    visible.slice(1).forEach(form => { form.hidden = true; });
  }

  function bind(){
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-panel]');
      if(!button) return;
      const name = button.dataset.panel;
      if(!valid.has(name)) return;
      applySection(name, {updateUrl:true});
      if(matchMedia('(max-width: 640px)').matches){
        document.querySelector('.account-tabs')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });

    window.addEventListener('hashchange', () => applySection(activeSectionFromHash()));
    window.addEventListener('popstate', () => applySection(activeSectionFromHash()));

    const authObserver = new MutationObserver(ensureSingleAuthForm);
    const authView = document.getElementById('authView');
    if(authView) authObserver.observe(authView,{subtree:true,attributes:true,attributeFilter:['hidden']});

    const accountView = document.getElementById('accountView');
    if(accountView){
      const accountObserver = new MutationObserver(() => {
        if(!accountView.hidden) applySection(activeSectionFromHash());
      });
      accountObserver.observe(accountView,{attributes:true,attributeFilter:['hidden']});
    }

    ensureSingleAuthForm();
    applySection(activeSectionFromHash());
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();
})();
