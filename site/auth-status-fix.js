(() => {
  'use strict';

  const PROJECT_REF = 'ydaeukhqwishlrjyfktk';
  const SUPABASE_PREFIX = `sb-${PROJECT_REF}-auth-token`;
  const AUTH_HINT_KEY = 'dlavie.auth.state.v1';
  const PROFILE_HINT_KEY = 'dlavie.profile.cache.v1';

  function meaningful(value){
    return !!value && !['null','undefined','{}','[]','""'].includes(String(value).trim());
  }

  function readAuthHint(){
    try{
      const raw = localStorage.getItem(AUTH_HINT_KEY);
      if(!meaningful(raw)) return false;
      if(raw === '1' || raw === 'true') return true;
      const parsed = JSON.parse(raw);
      return parsed === true || parsed?.signedIn === true || parsed?.signed_in === true || !!parsed?.userId;
    }catch{
      return false;
    }
  }

  function hasPersistedSupabaseSession(){
    try{
      if(readAuthHint()) return true;

      for(let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i) || '';
        if(key === SUPABASE_PREFIX || key.startsWith(`${SUPABASE_PREFIX}.`) || key.startsWith(`${SUPABASE_PREFIX}-`)){
          const raw = localStorage.getItem(key);
          if(meaningful(raw)) return true;
        }
      }
      return false;
    }catch{
      return false;
    }
  }

  function readProfileHint(){
    try{
      const raw = localStorage.getItem(PROFILE_HINT_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    }catch{
      return null;
    }
  }

  function sync(){
    const signedIn = hasPersistedSupabaseSession();
    const profile = readProfileHint();
    document.documentElement.dataset.auth = signedIn ? 'member' : 'guest';

    document.querySelectorAll('[data-dlavie-account-link]').forEach(link => {
      link.href = 'account.html';
      const label = signedIn ? 'Account' : 'Sign in';
      if(link.classList.contains('sheet-action')){
        if(link.dataset.authLabel !== label){
          const svg = link.querySelector('svg')?.outerHTML || '';
          link.innerHTML = `${svg}${label}`;
          link.dataset.authLabel = label;
        }
      }else if(link.textContent !== label){
        link.textContent = label;
      }
      if(signedIn && profile?.username){
        link.title = profile.display_name ? `${profile.display_name} (@${profile.username})` : `@${profile.username}`;
        link.dataset.profileUsername = profile.username;
      }else{
        link.removeAttribute('title');
        delete link.dataset.profileUsername;
      }
    });

    const accountPortal = document.querySelector('.home-portal[href="account.html"]');
    if(accountPortal){
      const title = accountPortal.querySelector('h3');
      const copy = accountPortal.querySelector('p');
      if(signedIn){
        if(title) title.textContent = profile?.display_name || 'Your account';
        if(copy) copy.textContent = profile?.username
          ? `@${profile.username} · Manage profile, security, preferences, and account data.`
          : 'Manage your DLavie profile, security, preferences, sessions, and account data.';
      }else{
        if(title) title.textContent = 'DLavie Account';
        if(copy) copy.textContent = 'Sign in once for Community, profile, security, preferences, and future DLavie services.';
      }
    }

    if(signedIn){
      document.querySelectorAll('.auth-explore-note').forEach(el => el.remove());
      document.querySelectorAll('.auth-required-lock').forEach(el => el.classList.remove('auth-required-lock'));
    }
  }

  function scheduleSync(){
    sync();
    setTimeout(sync, 0);
    setTimeout(sync, 80);
    setTimeout(sync, 260);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', scheduleSync, {once:true});
  }else{
    scheduleSync();
  }

  window.addEventListener('pageshow', scheduleSync, {passive:true});
  window.addEventListener('focus', scheduleSync, {passive:true});
  window.addEventListener('hashchange', scheduleSync, {passive:true});
  window.addEventListener('storage', event => {
    const key = event.key || '';
    if(key === AUTH_HINT_KEY || key === PROFILE_HINT_KEY || key.startsWith(SUPABASE_PREFIX)) scheduleSync();
  });
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible') scheduleSync();
  }, {passive:true});
})();
