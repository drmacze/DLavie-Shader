(() => {
  'use strict';

  const SUPABASE_URL = 'https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const CONSOLE_URL = 'team/dlv-ops-9f2c/?v=73';
  const $ = (selector, root = document) => root.querySelector(selector);
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9 3 12l5 3M16 9l5 3-5 3M14 5l-4 14"/></svg>';
  let role = null;

  function roleLabel() {
    return role === 'owner' ? 'OWNER' : 'DEVELOPER';
  }

  function consoleLink(className, label) {
    return `<a class="${className}" href="${CONSOLE_URL}">${icon}<span>${label}</span></a>`;
  }

  function applyUI() {
    if (!role) return;
    const label = roleLabel();
    document.body.dataset.dlvDeveloperRole = role;
    document.body.classList.add('dlv-has-developer-access');

    const badge = $('#roleBadge');
    if (badge) {
      badge.textContent = label;
      badge.classList.add('developer-role-badge');
      badge.title = `DLavie Developer · ${role}`;
    }

    const identity = $('.identity-line');
    if (identity && !$('#developerConsoleChip')) {
      identity.insertAdjacentHTML('beforeend', `<a id="developerConsoleChip" class="developer-console-chip" href="${CONSOLE_URL}">${icon}<span>Console</span></a>`);
    }

    const profile = $('.profile-header');
    const signout = $('#signOutButton');
    if (profile && signout && !$('#developerConsoleButton')) {
      signout.insertAdjacentHTML('beforebegin', consoleLink('developer-console-button', 'Buka Developer Console').replace('class="developer-console-button"', 'id="developerConsoleButton" class="developer-console-button"'));
    }

    const sideCards = [...document.querySelectorAll('.account-side .side-card')];
    const accountCard = sideCards.find(card => card.textContent.includes('ACCOUNT'));
    if (accountCard && !$('#developerRoleValue')) {
      const dl = $('dl', accountCard);
      dl?.insertAdjacentHTML('beforeend', `<div class="developer-role-row"><dt>Developer role</dt><dd id="developerRoleValue">${label}</dd></div>`);
    }

    const quick = sideCards.find(card => card.textContent.includes('QUICK LINKS'));
    if (quick && !$('#developerQuickLink')) {
      const kicker = $('.kicker', quick);
      kicker?.insertAdjacentHTML('afterend', `<a id="developerQuickLink" class="developer-quick-link" href="${CONSOLE_URL}">${icon}<span>Developer Console</span><b>→</b></a>`);
    }

    const menu = $('#dlvMobileMenu');
    if (menu && !menu.querySelector('[data-dlv-developer-console]')) {
      const groups = [...menu.querySelectorAll('.dlv-mobile-menu-group')];
      const dlavieGroup = groups.find(group => group.querySelector('.dlv-mobile-menu-label')?.textContent.trim() === 'DLavie');
      if (dlavieGroup) {
        const signOut = dlavieGroup.querySelector('[data-dlv-signout]');
        const link = document.createElement('a');
        link.href = CONSOLE_URL;
        link.dataset.dlvDeveloperConsole = 'true';
        link.className = 'dlv-developer-console-row';
        link.innerHTML = `<span class="dlv-dev-menu-icon">${icon}</span><span class="dlv-dev-menu-copy"><strong>Developer Console</strong><small>${label}</small></span><span class="dlv-menu-arrow">›</span>`;
        dlavieGroup.insertBefore(link, signOut || null);
      }
    }
  }

  async function readRole(sb) {
    const { data, error } = await sb.rpc('dlavie_my_developer_role');
    if (!error && (data === 'owner' || data === 'developer' || data === 'editor')) return data;

    // Compatibility fallback for older database state.
    const { data: sessionData } = await sb.auth.getSession();
    const session = sessionData?.session;
    if (!session) return null;
    const fallback = await sb.from('dlavie_developers').select('role').eq('user_id', session.user.id).maybeSingle();
    return fallback.error ? null : fallback.data?.role || null;
  }

  async function boot() {
    if (!window.supabase) return;
    try {
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
      });
      const { data: sessionData } = await sb.auth.getSession();
      if (!sessionData?.session) return;
      role = await readRole(sb);
      if (!role) return;
      applyUI();

      // Account UI is assembled by several lightweight runtime layers.
      // Re-apply only a few times so developer controls survive those renders.
      setTimeout(applyUI, 250);
      setTimeout(applyUI, 800);
      setTimeout(applyUI, 1600);

      const menu = $('#dlvMobileMenu');
      if (menu) new MutationObserver(applyUI).observe(menu, { childList: true, subtree: false });
    } catch (_) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
