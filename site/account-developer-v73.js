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

    const profile = $('.profile-header');
    if (profile && !$('#developerConsoleAccess')) {
      profile.insertAdjacentHTML('afterend', `
        <section id="developerConsoleAccess" class="developer-console-access" aria-label="Developer Console">
          <div class="developer-console-access-icon">${icon}</div>
          <div class="developer-console-access-copy">
            <span>DLAVIE TEAM · ${label}</span>
            <strong>Developer Console</strong>
            <p>Kelola project, thumbnail, versi Minecraft, tag, repository, branch, draft, dan publish.</p>
          </div>
          <a href="${CONSOLE_URL}" class="developer-console-access-button">Buka Console <b>→</b></a>
        </section>`);
    }

    const identity = $('.identity-line');
    if (identity && !$('#developerConsoleChip')) {
      identity.insertAdjacentHTML('beforeend', `<a id="developerConsoleChip" class="developer-console-chip" href="${CONSOLE_URL}">${icon}<span>Console</span></a>`);
    }

    const signout = $('#signOutButton');
    if (profile && signout && !$('#developerConsoleButton')) {
      signout.insertAdjacentHTML('beforebegin', `<a id="developerConsoleButton" class="developer-console-button" href="${CONSOLE_URL}">${icon}<span>Developer Console</span></a>`);
    }

    const sideCards = [...document.querySelectorAll('.account-side .side-card')];
    const accountCard = sideCards.find(card => card.textContent.includes('ACCOUNT'));
    if (accountCard && !$('#developerRoleValue')) {
      $('dl', accountCard)?.insertAdjacentHTML('beforeend', `<div class="developer-role-row"><dt>Developer role</dt><dd id="developerRoleValue">${label}</dd></div>`);
    }

    const quick = sideCards.find(card => card.textContent.includes('QUICK LINKS'));
    if (quick && !$('#developerQuickLink')) {
      $('.kicker', quick)?.insertAdjacentHTML('afterend', `<a id="developerQuickLink" class="developer-quick-link" href="${CONSOLE_URL}">${icon}<span>Developer Console</span><b>→</b></a>`);
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
    const rpc = await sb.rpc('dlavie_my_developer_role');
    if (!rpc.error && ['owner', 'developer', 'editor'].includes(rpc.data)) return rpc.data;

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
