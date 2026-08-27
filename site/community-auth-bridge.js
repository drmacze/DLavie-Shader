(() => {
  'use strict';

  const SUPABASE_URL = 'https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const COMMUNITY_API_MARKER = '/functions/v1/dlavie-community';
  const LEGACY_KEY = 'dlavie.community.session.v1';
  const originalFetch = window.fetch.bind(window);

  if (!window.supabase) {
    window.DLavieAuthBridge = { ready: Promise.resolve(null), client: null };
    return;
  }

  const authClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  let currentSession = null;
  let uiScheduled = false;

  const loginUrl = (mode = 'login') => `account.html?mode=${encodeURIComponent(mode)}&next=community`;
  const setText = (el, value) => { if (el && el.textContent !== value) el.textContent = value; };

  function syncLegacySentinel(session) {
    currentSession = session || null;
    if (session) localStorage.setItem(LEGACY_KEY, 'dlavie-account');
    else localStorage.removeItem(LEGACY_KEY);
  }

  async function freshSession() {
    const { data } = await authClient.auth.getSession();
    syncLegacySentinel(data.session || null);
    return data.session || null;
  }

  function fakeJson(status, payload) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  function readAction(init) {
    try {
      if (!init?.body || typeof init.body !== 'string') return '';
      return String(JSON.parse(init.body)?.action || '');
    } catch {
      return '';
    }
  }

  function normalizeHeaders(source) {
    const headers = new Headers(source || {});
    headers.delete('x-dlavie-session');
    headers.set('apikey', SUPABASE_KEY);
    headers.set('Content-Type', 'application/json');
    return headers;
  }

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (!url.includes(COMMUNITY_API_MARKER)) return originalFetch(input, init);

    const action = readAction(init);
    if (action === 'create_session') {
      return fakeJson(401, { ok: false, error: { code: 'ACCOUNT_REQUIRED', message: 'Sign in or create a DLavie Account to join the community.' } });
    }

    if (action === 'logout') {
      await authClient.auth.signOut({ scope: 'local' });
      syncLegacySentinel(null);
      return fakeJson(200, { ok: true, data: { logged_out: true } });
    }

    const session = await freshSession();
    if (!session) {
      return fakeJson(401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login diperlukan.' } });
    }

    const headers = normalizeHeaders(init.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);
    return originalFetch(input, { ...init, headers });
  };

  function decorateLoggedOutUI() {
    if (currentSession) return;
    setText(document.querySelector('#topProfileName'), 'Sign in');

    const join = document.querySelector('#composerJoin');
    if (join) {
      setText(join.querySelector('strong'), 'Sign in to join');
      setText(join.querySelector('span'), 'Use your DLavie Account to send messages, replies, and reactions.');
      setText(join.querySelector('#joinFromComposer'), 'Sign in');
    }

    setText(document.querySelector('#joinTitle'), 'Use a DLavie Account.');
    const joinModal = document.querySelector('#joinModal');
    if (joinModal) {
      setText(joinModal.querySelector('.join-modal > p'), 'Community posting now requires a verified DLavie account session. Sign in or register to continue.');
      setText(joinModal.querySelector('#joinForm button[type="submit"]'), 'Continue to account');
    }
  }

  function scheduleDecorate() {
    if (uiScheduled) return;
    uiScheduled = true;
    requestAnimationFrame(() => {
      uiScheduled = false;
      decorateLoggedOutUI();
    });
  }

  function interceptAccountRequired(event) {
    if (currentSession) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const trigger = target.closest('#joinFromComposer,#profileButton,#joinForm button[type="submit"]');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    location.href = loginUrl(trigger.closest('#joinForm') ? 'register' : 'login');
  }

  document.addEventListener('click', interceptAccountRequired, true);
  document.addEventListener('submit', event => {
    if (currentSession) return;
    if (event.target?.id !== 'joinForm') return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    location.href = loginUrl('register');
  }, true);

  const ready = (async () => {
    const session = await freshSession();
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    }
    decorateLoggedOutUI();
    const observer = new MutationObserver(scheduleDecorate);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return session;
  })();

  authClient.auth.onAuthStateChange((_event, session) => {
    const previous = !!currentSession;
    syncLegacySentinel(session || null);
    scheduleDecorate();
    if (previous !== !!session && document.readyState === 'complete') {
      setTimeout(() => location.reload(), 80);
    }
  });

  window.DLavieAuthBridge = {
    ready,
    client: authClient,
    getSession: freshSession,
    goToAccount(mode = 'login') { location.href = loginUrl(mode); }
  };
})();
