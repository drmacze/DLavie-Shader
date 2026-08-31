(() => {
  'use strict';

  const SUPABASE_URL = 'https://ydaeukhqwishlrjyfktk.supabase.co';
  const API = `${SUPABASE_URL}/functions/v1/dlavie-console-pin`;
  const TOKEN_KEY = 'dlavie.console.pin.session.v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const dash = { projects: [], github: new Map(), refreshing: false, booted: false };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const cleanRepo = (v) => String(v || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '').split('/').slice(0, 2).join('/');
  const token = () => localStorage.getItem(TOKEN_KEY) || '';

  function toast(message) {
    const el = $('#devToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  async function api(action, payload = {}) {
    const t = token();
    if (!t) throw new Error('PIN_REQUIRED');
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-dlavie-console-token': t },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await res.json().catch(() => ({ ok:false, error:`HTTP ${res.status}` }));
    if (!res.ok || !data.ok) throw new Error(data.error || 'Request gagal');
    return data;
  }

  function dateValue(v) {
    const n = Date.parse(v || '');
    return Number.isFinite(n) ? n : 0;
  }
  function relativeDate(v) {
    const time = dateValue(v);
    if (!time) return '—';
    const diff = Date.now() - time;
    const minute = 60_000, hour = 3_600_000, day = 86_400_000;
    if (diff < minute) return 'baru saja';
    if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} mnt lalu`;
    if (diff < day) return `${Math.floor(diff / hour)} jam lalu`;
    if (diff < 7 * day) return `${Math.floor(diff / day)} hari lalu`;
    return new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'short', year:'numeric' }).format(new Date(time));
  }

  function health(project) {
    let score = 0;
    const issues = [];
    const checks = [
      [project.thumbnail_url, 12, 'Thumbnail belum ada'],
      [String(project.summary || '').trim().length >= 25, 10, 'Deskripsi singkat terlalu pendek'],
      [String(project.description || '').trim().length >= 120, 14, 'Deskripsi lengkap masih tipis'],
      [project.version, 8, 'Versi project belum diisi'],
      [Array.isArray(project.minecraft_versions) && project.minecraft_versions.length, 12, 'Versi Minecraft belum diisi'],
      [Array.isArray(project.platforms) && project.platforms.length, 10, 'Platform belum dipilih'],
      [Array.isArray(project.tags) && project.tags.length >= 2, 8, 'Tambahkan minimal 2 tag'],
      [cleanRepo(project.github_repo).includes('/'), 12, 'Repository GitHub belum valid'],
      [String(project.github_branch || '').trim(), 8, 'Branch GitHub belum diisi'],
      [project.status !== 'published' || project.published_at, 6, 'Tanggal publish belum tercatat']
    ];
    checks.forEach(([ok, points, issue]) => { if (ok) score += points; else issues.push(issue); });
    return { score: Math.min(100, score), issues };
  }

  function projectStatusCounts(projects) {
    return {
      published: projects.filter(p => p.status === 'published').length,
      draft: projects.filter(p => p.status === 'draft').length,
      archived: projects.filter(p => p.status === 'archived').length,
      featured: projects.filter(p => p.featured).length,
      bedrock: projects.filter(p => (p.platforms || []).includes('bedrock')).length,
      java: projects.filter(p => (p.platforms || []).includes('java')).length
    };
  }

  function safeSet(id, value) { const el = $(id); if (el) el.textContent = value; }

  function renderDashboard() {
    const p = dash.projects;
    const c = projectStatusCounts(p);
    const scores = p.map(x => health(x).score);
    const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 100;
    const needsWork = p.filter(x => health(x).score < 75).length;
    const updatedWeek = p.filter(x => Date.now() - dateValue(x.updated_at || x.created_at) <= 7 * 86_400_000).length;
    const sourceReady = p.filter(x => cleanRepo(x.github_repo).includes('/') && x.github_branch).length;

    safeSet('#metricArchived', c.archived);
    safeSet('#metricBedrock', c.bedrock);
    safeSet('#metricJava', c.java);
    safeSet('#metricNeedsWork', needsWork);
    safeSet('#metricUpdatedWeek', updatedWeek);
    safeSet('#catalogHealthScore', `${avg}%`);
    safeSet('#sourceReadyCount', `${sourceReady}/${p.length}`);

    const ring = $('#catalogHealthRing');
    if (ring) ring.style.setProperty('--score', `${avg * 3.6}deg`);
    const statusBar = $('#statusDistribution');
    if (statusBar) {
      const total = Math.max(1, p.length);
      statusBar.innerHTML = `
        <span class="bar-published" style="width:${(c.published/total)*100}%"></span>
        <span class="bar-draft" style="width:${(c.draft/total)*100}%"></span>
        <span class="bar-archived" style="width:${(c.archived/total)*100}%"></span>`;
    }
    const sourceBar = $('#sourceCoverageBar');
    if (sourceBar) sourceBar.style.width = `${p.length ? (sourceReady / p.length) * 100 : 100}%`;

    const attention = $('#dashboardAttention');
    if (attention) {
      const rows = [...p]
        .map(project => ({ project, h:health(project) }))
        .filter(x => x.h.score < 85)
        .sort((a,b) => a.h.score - b.h.score)
        .slice(0,4);
      attention.innerHTML = rows.length ? rows.map(({project,h}) => `
        <button class="attention-row" type="button" data-dash-edit="${esc(project.id)}">
          <span class="health-dot ${h.score < 60 ? 'bad' : 'warn'}"></span>
          <span><strong>${esc(project.name || project.slug)}</strong><small>${esc(h.issues[0] || 'Perlu dilengkapi')}</small></span>
          <b>${h.score}%</b>
        </button>`).join('') : '<div class="dash-empty good">Semua project sudah dalam kondisi baik.</div>';
    }

    const recent = $('#dashboardRecentActivity');
    if (recent) recent.innerHTML = activityItems(p).slice(0,5).map(activityHtml).join('') || '<div class="dash-empty">Belum ada aktivitas.</div>';
  }

  function renderHealth() {
    const root = $('#healthProjectList');
    if (!root) return;
    const filter = $('#healthFilter')?.value || 'all';
    const rows = dash.projects.map(project => ({ project, h:health(project) }))
      .filter(x => filter === 'all' || (filter === 'problem' && x.h.score < 75) || (filter === 'good' && x.h.score >= 75))
      .sort((a,b) => a.h.score - b.h.score);
    root.innerHTML = rows.length ? rows.map(({project,h}) => {
      const gh = dash.github.get(project.id);
      const ghClass = gh?.ok ? 'ok' : gh?.checked ? 'bad' : 'idle';
      const ghText = gh?.ok ? `GitHub OK · ${esc(gh.sha || '')}` : gh?.checked ? esc(gh.message || 'Source bermasalah') : 'Belum dicek';
      return `<article class="health-row">
        <div class="health-score ${h.score < 60 ? 'bad' : h.score < 80 ? 'warn' : 'good'}"><strong>${h.score}</strong><small>/100</small></div>
        <div class="health-copy"><strong>${esc(project.name || project.slug)}</strong><p>${h.issues.length ? esc(h.issues.slice(0,3).join(' · ')) : 'Metadata lengkap dan siap.'}</p><div class="health-meta"><span class="source-state ${ghClass}">${ghText}</span><span>${esc(project.status)}</span><span>${relativeDate(project.updated_at || project.created_at)}</span></div></div>
        <div class="health-actions"><button type="button" data-dash-check="${esc(project.id)}">Cek source</button><button type="button" data-dash-edit="${esc(project.id)}">Edit</button></div>
      </article>`;
    }).join('') : '<div class="dash-empty">Tidak ada project untuk filter ini.</div>';
  }

  function activityItems(projects) {
    const items = [];
    projects.forEach(p => {
      if (p.created_at) items.push({ type:'created', at:p.created_at, project:p });
      if (p.updated_at && p.updated_at !== p.created_at) items.push({ type:'updated', at:p.updated_at, project:p });
      if (p.published_at) items.push({ type:'published', at:p.published_at, project:p });
    });
    return items.sort((a,b) => dateValue(b.at) - dateValue(a.at));
  }
  function activityHtml(item) {
    const label = item.type === 'published' ? 'Dipublish' : item.type === 'created' ? 'Dibuat' : 'Diperbarui';
    const icon = item.type === 'published' ? '↑' : item.type === 'created' ? '+' : '↻';
    return `<button type="button" class="activity-row" data-dash-edit="${esc(item.project.id)}"><span class="activity-icon ${item.type}">${icon}</span><span><strong>${label} · ${esc(item.project.name || item.project.slug)}</strong><small>${relativeDate(item.at)} · ${esc(item.project.version || 'tanpa versi')}</small></span></button>`;
  }
  function renderActivity() {
    const root = $('#activityTimeline');
    if (!root) return;
    const q = ($('#activitySearch')?.value || '').trim().toLowerCase();
    const rows = activityItems(dash.projects).filter(x => !q || `${x.project.name} ${x.project.slug} ${x.type}`.toLowerCase().includes(q));
    root.innerHTML = rows.length ? rows.slice(0,100).map(activityHtml).join('') : '<div class="dash-empty">Belum ada aktivitas yang cocok.</div>';
  }

  function renderProjectActions() {
    $$('.project-admin-row').forEach(row => {
      if (row.querySelector('.dash-row-actions')) return;
      const id = row.dataset.editProject;
      const p = dash.projects.find(x => String(x.id) === String(id));
      if (!p) return;
      const meta = row.querySelector('.row-meta') || row;
      const actions = document.createElement('div');
      actions.className = 'dash-row-actions';
      const repo = cleanRepo(p.github_repo);
      actions.innerHTML = `
        ${repo.includes('/') ? `<button type="button" title="Buka GitHub" data-dash-github="${esc(p.id)}">GH</button>` : ''}
        <button type="button" title="Duplikat" data-dash-duplicate="${esc(p.id)}">⧉</button>
        <button type="button" title="${p.status === 'archived' ? 'Pulihkan' : 'Arsipkan'}" data-dash-archive="${esc(p.id)}">${p.status === 'archived' ? '↥' : '⌁'}</button>`;
      meta.appendChild(actions);
    });
  }

  function uniqueCopySlug(p) {
    const base = `${p.slug || 'project'}-copy`;
    let candidate = base, i = 2;
    const used = new Set(dash.projects.map(x => x.slug));
    while (used.has(candidate)) candidate = `${base}-${i++}`;
    return candidate;
  }
  function cloneForSave(p, overrides = {}) {
    return {
      slug:p.slug, name:p.name || '', summary:p.summary || '', description:p.description || '', version:p.version || '',
      minecraft_versions:[...(p.minecraft_versions || [])], platforms:[...(p.platforms || [])], tags:[...(p.tags || [])],
      github_repo:p.github_repo || '', github_branch:p.github_branch || 'main', thumbnail_url:p.thumbnail_url || null,
      gallery_urls:[...(p.gallery_urls || [])], featured:!!p.featured, status:p.status || 'draft', sort_order:Number(p.sort_order) || 100,
      metadata:p.metadata || {}, ...overrides
    };
  }

  async function duplicateProject(id) {
    const p = dash.projects.find(x => String(x.id) === String(id));
    if (!p) return;
    const copy = cloneForSave(p, { id:undefined, slug:uniqueCopySlug(p), name:`${p.name || p.slug} Copy`, status:'draft', featured:false });
    await api('save_project', { id:null, project:copy });
    toast('Project berhasil diduplikat sebagai draft');
    await refresh(true);
  }
  async function toggleArchive(id) {
    const p = dash.projects.find(x => String(x.id) === String(id));
    if (!p) return;
    const restoring = p.status === 'archived';
    await api('save_project', { id:p.id, project:cloneForSave(p, { status:restoring ? 'draft' : 'archived', featured:restoring ? p.featured : false }) });
    toast(restoring ? 'Project dipulihkan ke draft' : 'Project diarsipkan');
    await refresh(true);
  }

  function editProject(id) {
    const search = $('#projectAdminSearch');
    const filter = $('#projectStatusFilter');
    if (search) { search.value = ''; search.dispatchEvent(new Event('input', { bubbles:true })); }
    if (filter) { filter.value = 'all'; filter.dispatchEvent(new Event('change', { bubbles:true })); }
    const row = $(`[data-edit-project="${CSS.escape(String(id))}"]`, $('#allProjects') || document) || $(`[data-edit-project="${CSS.escape(String(id))}"]`);
    if (row) { row.click(); return; }
    $('[data-panel="projects"]')?.click();
    setTimeout(() => $(`[data-edit-project="${CSS.escape(String(id))}"]`)?.click(), 80);
  }

  async function checkGithubProject(id) {
    const p = dash.projects.find(x => String(x.id) === String(id));
    if (!p) return;
    const repo = cleanRepo(p.github_repo), branch = String(p.github_branch || '').trim();
    if (!repo.includes('/') || !branch) {
      dash.github.set(p.id, { checked:true, ok:false, message:'Repo/branch belum lengkap' });
      renderHealth(); return;
    }
    dash.github.set(p.id, { checked:true, ok:false, message:'Memeriksa…' });
    renderHealth();
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/branches/${encodeURIComponent(branch)}`, { headers:{ Accept:'application/vnd.github+json' } });
      if (!res.ok) throw new Error(res.status === 404 ? 'Repo/branch tidak ditemukan' : `GitHub ${res.status}`);
      const json = await res.json();
      dash.github.set(p.id, { checked:true, ok:true, sha:String(json.commit?.sha || '').slice(0,7) });
    } catch (e) {
      dash.github.set(p.id, { checked:true, ok:false, message:e.message || 'Gagal cek GitHub' });
    }
    renderHealth();
  }
  async function checkAllGithub() {
    const btn = $('[data-dash-check-all]');
    if (btn) { btn.disabled = true; btn.textContent = 'Memeriksa…'; }
    const candidates = dash.projects.filter(p => cleanRepo(p.github_repo).includes('/') && p.github_branch).slice(0,20);
    for (const p of candidates) await checkGithubProject(p.id);
    if (btn) { btn.disabled = false; btn.textContent = 'Cek semua source'; }
    toast(`Pemeriksaan GitHub selesai · ${candidates.length} project`);
  }

  function exportCatalog() {
    const data = JSON.stringify(dash.projects, null, 2);
    const blob = new Blob([data], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dlavie-catalog-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Katalog JSON diexport');
  }

  async function refresh(silent = false) {
    if (dash.refreshing || !token()) return;
    dash.refreshing = true;
    const refreshBtn = $('[data-dash-refresh]');
    if (refreshBtn) refreshBtn.classList.add('spinning');
    try {
      const data = await api('list_projects');
      dash.projects = data.projects || [];
      renderDashboard(); renderHealth(); renderActivity();
      setTimeout(renderProjectActions, 40);
      if (!silent) toast('Dashboard diperbarui');
    } catch (e) {
      if (e.message !== 'PIN_REQUIRED' && e.message !== 'SESSION_EXPIRED') toast(e.message || 'Gagal memuat dashboard');
    } finally {
      dash.refreshing = false;
      if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
  }

  function bindActions() {
    document.addEventListener('click', async (e) => {
      const button = e.target.closest('[data-dash-refresh],[data-dash-check-all],[data-dash-export],[data-dash-edit],[data-dash-check],[data-dash-duplicate],[data-dash-archive],[data-dash-github]');
      if (!button) return;
      e.preventDefault(); e.stopPropagation();
      try {
        if (button.hasAttribute('data-dash-refresh')) await refresh();
        else if (button.hasAttribute('data-dash-check-all')) await checkAllGithub();
        else if (button.hasAttribute('data-dash-export')) exportCatalog();
        else if (button.dataset.dashEdit) editProject(button.dataset.dashEdit);
        else if (button.dataset.dashCheck) await checkGithubProject(button.dataset.dashCheck);
        else if (button.dataset.dashDuplicate) await duplicateProject(button.dataset.dashDuplicate);
        else if (button.dataset.dashArchive) await toggleArchive(button.dataset.dashArchive);
        else if (button.dataset.dashGithub) {
          const p = dash.projects.find(x => String(x.id) === String(button.dataset.dashGithub));
          const repo = cleanRepo(p?.github_repo); if (repo.includes('/')) window.open(`https://github.com/${repo}/tree/${encodeURIComponent(p.github_branch || 'main')}`, '_blank', 'noopener');
        }
      } catch (err) { toast(err.message || 'Aksi gagal'); }
    });
    $('#healthFilter')?.addEventListener('change', renderHealth);
    $('#activitySearch')?.addEventListener('input', renderActivity);
  }

  function watchProjectRows() {
    ['allProjects','recentProjects'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      new MutationObserver(() => setTimeout(renderProjectActions, 0)).observe(el, { childList:true });
    });
  }

  function maybeStart() {
    const app = $('#consoleApp');
    if (!app || app.hidden || getComputedStyle(app).display === 'none' || !token()) return;
    refresh(true);
  }

  function boot() {
    if (dash.booted) return;
    dash.booted = true;
    bindActions(); watchProjectRows();
    const app = $('#consoleApp');
    if (app) new MutationObserver(maybeStart).observe(app, { attributes:true, attributeFilter:['hidden','style','class'] });
    maybeStart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();