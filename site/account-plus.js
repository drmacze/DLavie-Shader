(() => {
  'use strict';

  const SUPABASE_URL = 'https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const DOWNLOAD_KEY = 'dlavie.download.history.v1';
  const RETURN_KEY = 'dlavie.account.return.v1';
  const PROJECTS = {
    'dlavie-shader': {
      title: 'DLavie Shader',
      version: 'v0.1.2',
      type: 'Shader',
      platform: 'Bedrock',
      icon: 'assets/dlavie-shader.svg',
      href: './#project/dlavie-shader',
      description: 'Vibrant Visuals + PBR untuk Minecraft Bedrock, dibuat mobile-first.'
    }
  };

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  let sb = null;
  let session = null;
  let account = null;
  let saved = [];

  function createClient(){
    if(sb || !window.supabase?.createClient) return sb;
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
    });
    return sb;
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function formatDate(value){
    if(!value) return '—';
    try{return new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value));}catch{return '—';}
  }

  function relative(value){
    if(!value) return '—';
    const ms = Date.now() - new Date(value).getTime();
    const min = Math.max(0, Math.floor(ms/60000));
    if(min < 1) return 'baru saja';
    if(min < 60) return `${min} mnt lalu`;
    const h = Math.floor(min/60);
    if(h < 24) return `${h} jam lalu`;
    const d = Math.floor(h/24);
    if(d < 30) return `${d} hari lalu`;
    return formatDate(value);
  }

  function browserName(){
    const ua = navigator.userAgent || '';
    if(/CriOS|Chrome/i.test(ua) && !/EdgiOS|OPiOS/i.test(ua)) return 'Chrome';
    if(/FxiOS|Firefox/i.test(ua)) return 'Firefox';
    if(/EdgiOS|Edg/i.test(ua)) return 'Edge';
    if(/Safari/i.test(ua)) return /iPhone|iPad|iPod/i.test(ua) ? 'Safari di iPhone/iPad' : 'Safari';
    return 'Browser ini';
  }

  function deviceName(){
    const ua = navigator.userAgent || '';
    if(/iPhone/i.test(ua)) return 'iPhone';
    if(/iPad/i.test(ua)) return 'iPad';
    if(/Android/i.test(ua)) return 'Android';
    if(/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
    if(/Windows/i.test(ua)) return 'Windows PC';
    if(/Linux/i.test(ua)) return 'Linux';
    return 'Perangkat saat ini';
  }

  function readDownloads(){
    try{
      const parsed = JSON.parse(localStorage.getItem(DOWNLOAD_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.slice(0,20) : [];
    }catch{return [];}
  }

  function notify(text){
    const toast = $('#accountToast');
    if(!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(notify.t);
    notify.t=setTimeout(()=>toast.classList.remove('show'),2300);
  }

  function injectShell(){
    const tabs = $('.account-tabs');
    const stack = $('.panel-stack');
    if(!tabs || !stack || $('[data-panel="overview"]')) return;

    tabs.insertAdjacentHTML('afterbegin', `
      <button type="button" data-panel="overview">Ringkasan</button>
      <button type="button" data-panel="saved">Tersimpan</button>`);

    stack.insertAdjacentHTML('afterbegin', `
      <article class="account-panel" data-account-panel="overview" hidden>
        <div class="panel-head plus-panel-head"><div><span class="kicker">AKUN DLAVIE</span><h2>Ringkasan</h2><p class="panel-subtitle">Status akun, aktivitas, dan hal penting dalam satu tempat.</p></div><a class="plus-open-project" href="./#project/dlavie-shader">Buka project →</a></div>
        <div class="account-kpi-grid">
          <article><span>Project tersimpan</span><strong id="plusSavedCount">—</strong><small>tersinkron ke akun</small></article>
          <article><span>Pesan komunitas</span><strong id="plusMessageCount">—</strong><small>pesan yang terlihat</small></article>
          <article><span>Reaksi</span><strong id="plusReactionCount">—</strong><small>aktivitas komunitas</small></article>
          <article><span>Download perangkat</span><strong id="plusDownloadCount">—</strong><small>hanya tersimpan lokal</small></article>
        </div>
        <div class="account-health-grid">
          <article class="plus-card">
            <div class="plus-card-head"><div><span class="kicker">PROFIL</span><h3>Kelengkapan profil</h3></div><strong id="plusProfilePercent">0%</strong></div>
            <div class="plus-progress"><i id="plusProfileBar"></i></div>
            <div class="plus-checks" id="plusProfileChecks"></div>
          </article>
          <article class="plus-card">
            <div class="plus-card-head"><div><span class="kicker">KEAMANAN</span><h3>Status akun</h3></div><span class="plus-state" id="plusSecurityState">Memuat…</span></div>
            <div class="plus-security-list">
              <div><span>Email</span><b id="plusEmailSecurity">—</b></div>
              <div><span>Perangkat ini</span><b id="plusDevice">—</b></div>
              <div><span>Aktif terakhir</span><b id="plusLastSeen">—</b></div>
            </div>
            <a class="plus-text-link" href="#security">Kelola keamanan →</a>
          </article>
        </div>
        <article class="plus-card plus-activity-card">
          <div class="plus-card-head"><div><span class="kicker">AKTIVITAS</span><h3>Aktivitas terbaru</h3></div><a class="plus-text-link" href="community.html">Komunitas →</a></div>
          <div class="plus-activity-list" id="plusActivityList"><div class="plus-loading">Memuat aktivitas…</div></div>
        </article>
      </article>

      <article class="account-panel" data-account-panel="saved" hidden>
        <div class="panel-head plus-panel-head"><div><span class="kicker">LIBRARY</span><h2>Tersimpan</h2><p class="panel-subtitle">Project yang kamu simpan tersinkron ke akun. Riwayat download tetap lokal di perangkat ini.</p></div></div>
        <section class="plus-saved-section">
          <div class="plus-section-title"><div><h3>Project tersimpan</h3><p>Akses cepat ke project favoritmu.</p></div></div>
          <div id="plusSavedProjects" class="plus-saved-list"><div class="plus-loading">Memuat project…</div></div>
        </section>
        <section class="plus-saved-section plus-device-history">
          <div class="plus-section-title"><div><h3>Riwayat download perangkat</h3><p>Data ini tidak dikirim ke server DLavie.</p></div><button class="secondary-button compact" id="plusClearDownloads" type="button">Hapus riwayat</button></div>
          <div id="plusDownloadHistory" class="plus-history-list"></div>
        </section>
      </article>`);

    const prefTheme = $('#prefTheme');
    const legacySetting = prefTheme?.closest('.select-setting');
    if(legacySetting) legacySetting.hidden = true;
    const prefForm = $('#preferencesForm');
    if(prefForm && !$('#accountThemePreference')){
      const button = prefForm.querySelector('button[type="submit"]');
      const wrap=document.createElement('div');
      wrap.className='account-theme-setting';
      wrap.innerHTML=`<div><strong>Tema tampilan</strong><span>Tersinkron ke akun dan dipakai saat kamu membuka DLavie di perangkat lain.</span></div><div class="account-theme-control"><select id="accountThemePreference" aria-label="Tema tampilan"><option value="light">Light</option><option value="dark">Dark</option><option value="system">Ikuti perangkat</option></select><button type="button" id="saveAccountTheme" class="secondary-button">Simpan tema</button></div>`;
      button?.insertAdjacentElement('beforebegin',wrap);
    }

    const security = $('[data-account-panel="security"]');
    if(security && !$('#plusCurrentSession')){
      security.insertAdjacentHTML('beforeend', `<hr><section class="settings-section plus-session" id="plusCurrentSession"><div class="setting-copy"><h3>Sesi saat ini</h3><p>Informasi perangkat ini ditampilkan lokal. Gunakan “Sign out everywhere” jika kamu merasa akun dipakai di perangkat lain.</p></div><div class="plus-session-grid"><div><span>Perangkat</span><b id="plusSessionDevice">—</b></div><div><span>Browser</span><b id="plusSessionBrowser">—</b></div><div><span>Terakhir sinkron</span><b id="plusSessionSync">—</b></div></div></section>`);
    }
  }

  function normalizeExistingFields(){
    const regName=$('#registerDisplayName'); if(regName) regName.maxLength=24;
    const profileName=$('#profileDisplayName'); if(profileName) profileName.maxLength=24;
    const bio=$('#profileBio'); if(bio) bio.maxLength=160;
    const bioCounter=$('#bioCount')?.parentElement; if(bioCounter) bioCounter.innerHTML='<span id="bioCount">0</span>/160';
    const usernameCopy=$('#usernameForm .setting-copy p'); if(usernameCopy) usernameCopy.textContent='Username unik akunmu. Bisa diganti lagi 24 jam setelah perubahan terakhir.';

    const labels = {
      '[data-auth-tab="login"]':'Masuk','[data-auth-tab="register"]':'Daftar',
      '#signOutButton':'Keluar','[data-panel="profile"]':'Profil','[data-panel="security"]':'Keamanan',
      '[data-panel="preferences"]':'Preferensi','[data-panel="data"]':'Data & privasi'
    };
    Object.entries(labels).forEach(([sel,text])=>{const el=$(sel);if(el)el.textContent=text;});
    const home=$('.top-actions a[href="./#home"]'); if(home)home.textContent='Beranda';
    const community=$('.top-actions a[href="community.html"]'); if(community)community.textContent='Komunitas';
  }

  async function getSession(){
    createClient();
    if(!sb) return null;
    const {data}=await sb.auth.getSession();
    session=data?.session||null;
    return session;
  }

  async function loadAccountData(){
    const s=await getSession();
    if(!s) return null;
    const {data,error}=await sb.from('dlavie_accounts')
      .select('user_id,member_id,username,display_name,bio,avatar_seed,is_verified,status,theme_preference,last_seen,created_at,updated_at,preferences')
      .eq('user_id',s.user.id).single();
    if(error) throw error;
    account=data;
    return data;
  }

  async function loadSaved(){
    const s=session || await getSession();
    if(!s){saved=[];return saved;}
    const {data,error}=await sb.from('dlavie_saved_projects').select('project_slug,created_at').eq('user_id',s.user.id).order('created_at',{ascending:false});
    if(error) throw error;
    saved=data||[];
    return saved;
  }

  async function communityStats(memberId){
    if(!memberId) return {messages:0,reactions:0,recent:[]};
    const [m,r,recent] = await Promise.all([
      sb.from('dlavie_community_messages').select('id',{count:'exact',head:true}).eq('member_id',memberId),
      sb.from('dlavie_community_reactions').select('message_id',{count:'exact',head:true}).eq('member_id',memberId),
      sb.from('dlavie_community_messages').select('body,created_at').eq('member_id',memberId).order('created_at',{ascending:false}).limit(4)
    ]);
    return {messages:m.count||0,reactions:r.count||0,recent:recent.data||[]};
  }

  function profileScore(){
    const checks=[
      {ok:!!session?.user?.email_confirmed_at,label:'Email terverifikasi'},
      {ok:!!account?.display_name?.trim(),label:'Display name terisi'},
      {ok:!!account?.bio?.trim(),label:'Bio profil terisi'},
      {ok:!!account?.avatar_seed,label:'Avatar dipilih'}
    ];
    const score=Math.round(checks.filter(x=>x.ok).length/checks.length*100);
    return {score,checks};
  }

  function renderProfileHealth(){
    const {score,checks}=profileScore();
    $('#plusProfilePercent').textContent=`${score}%`;
    $('#plusProfileBar').style.width=`${score}%`;
    $('#plusProfileChecks').innerHTML=checks.map(x=>`<div class="${x.ok?'done':''}"><span>${x.ok?'✓':'○'}</span>${escapeHtml(x.label)}</div>`).join('');
  }

  function renderSecurity(){
    const verified=!!session?.user?.email_confirmed_at;
    $('#plusEmailSecurity').textContent=verified?'Terverifikasi':'Belum diverifikasi';
    $('#plusEmailSecurity').className=verified?'good':'warn';
    $('#plusSecurityState').textContent=verified?'Aman':'Perlu perhatian';
    $('#plusSecurityState').className=`plus-state ${verified?'good':'warn'}`;
    $('#plusDevice').textContent=`${deviceName()} · ${browserName()}`;
    $('#plusLastSeen').textContent=relative(account?.last_seen);
    $('#plusSessionDevice').textContent=deviceName();
    $('#plusSessionBrowser').textContent=browserName();
    $('#plusSessionSync').textContent=relative(account?.last_seen);
  }

  function renderSavedProjects(){
    const container=$('#plusSavedProjects'); if(!container)return;
    const savedSet=new Map(saved.map(x=>[x.project_slug,x]));
    const entries=Object.entries(PROJECTS);
    container.innerHTML=entries.map(([slug,p])=>{
      const row=savedSet.get(slug);
      return `<article class="plus-project-row ${row?'is-saved':''}" data-plus-project="${slug}"><img src="${p.icon}" alt=""><div class="plus-project-copy"><div><h3>${escapeHtml(p.title)}</h3><span>${escapeHtml(p.version)}</span></div><p>${escapeHtml(p.description)}</p><div class="plus-project-meta"><span>${escapeHtml(p.type)}</span><span>${escapeHtml(p.platform)}</span>${row?`<span>Disimpan ${escapeHtml(relative(row.created_at))}</span>`:''}</div></div><div class="plus-project-actions"><a href="${p.href}">Buka</a><button type="button" data-toggle-saved="${slug}" class="${row?'saved':''}">${row?'Tersimpan':'Simpan'}</button></div></article>`;
    }).join('');
    $$('[data-toggle-saved]',container).forEach(btn=>btn.addEventListener('click',()=>toggleSaved(btn.dataset.toggleSaved)));
    $('#plusSavedCount').textContent=String(saved.length);
  }

  function renderDownloadHistory(){
    const history=readDownloads();
    $('#plusDownloadCount').textContent=String(history.length);
    const out=$('#plusDownloadHistory'); if(!out)return;
    if(!history.length){
      out.innerHTML='<div class="plus-empty"><strong>Belum ada riwayat download</strong><span>Download dari halaman project akan muncul di sini, hanya di perangkat ini.</span></div>';
      return;
    }
    out.innerHTML=history.map(item=>`<div class="plus-history-row"><div class="plus-history-icon">↓</div><div><strong>${escapeHtml(item.title||'DLavie Project')}</strong><span>${escapeHtml(item.version||'Latest')} · ${escapeHtml(relative(item.at))}</span></div><a href="${escapeHtml(item.href||'./#project/dlavie-shader')}">Buka</a></div>`).join('');
  }

  function renderActivity(stats){
    const activity=[];
    stats.recent.forEach(x=>activity.push({at:x.created_at,icon:'💬',title:'Pesan komunitas',detail:String(x.body||'').slice(0,90)}));
    saved.slice(0,3).forEach(x=>activity.push({at:x.created_at,icon:'★',title:'Project disimpan',detail:PROJECTS[x.project_slug]?.title||x.project_slug}));
    readDownloads().slice(0,4).forEach(x=>activity.push({at:x.at,icon:'↓',title:'Download di perangkat',detail:`${x.title||'DLavie Project'} ${x.version||''}`.trim()}));
    if(account?.updated_at && account?.created_at && new Date(account.updated_at)-new Date(account.created_at)>60000){
      activity.push({at:account.updated_at,icon:'✓',title:'Profil diperbarui',detail:'Perubahan profil tersimpan ke akun.'});
    }
    activity.sort((a,b)=>new Date(b.at)-new Date(a.at));
    const out=$('#plusActivityList'); if(!out)return;
    if(!activity.length){out.innerHTML='<div class="plus-empty"><strong>Belum ada aktivitas</strong><span>Simpan project, download versi, atau gunakan Community.</span></div>';return;}
    out.innerHTML=activity.slice(0,6).map(x=>`<div class="plus-activity-row"><div class="plus-activity-icon">${x.icon}</div><div><strong>${escapeHtml(x.title)}</strong><span>${escapeHtml(x.detail)}</span></div><time>${escapeHtml(relative(x.at))}</time></div>`).join('');
  }

  function renderTheme(){
    const select=$('#accountThemePreference'); if(!select)return;
    const value=['light','dark','system'].includes(account?.theme_preference)?account.theme_preference:'light';
    select.value=value;
  }

  async function applyThemePreference(value, persist=true){
    if(!['light','dark','system'].includes(value)) value='light';
    const resolved=value==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):value;
    document.documentElement.dataset.theme=resolved;
    try{localStorage.setItem('dlavie.theme.v1',value);}catch{}
    const meta=$('meta[name="theme-color"]'); if(meta)meta.content=resolved==='light'?'#f5f7f4':'#111113';
    if(persist && session){
      const {error}=await sb.from('dlavie_accounts').update({theme_preference:value}).eq('user_id',session.user.id);
      if(error) throw error;
      if(account) account.theme_preference=value;
    }
  }

  async function toggleSaved(slug){
    const s=session || await getSession();
    if(!s){
      try{sessionStorage.setItem(RETURN_KEY,`${location.origin}${location.pathname.replace(/account\.html$/,'')}#project/${slug}`);}catch{}
      location.href='account.html?next=project';
      return;
    }
    const exists=saved.some(x=>x.project_slug===slug);
    const query=exists
      ? sb.from('dlavie_saved_projects').delete().eq('user_id',s.user.id).eq('project_slug',slug)
      : sb.from('dlavie_saved_projects').insert({user_id:s.user.id,project_slug:slug});
    const {error}=await query;
    if(error){notify(error.message||'Gagal memperbarui project.');return;}
    await loadSaved();
    renderSavedProjects();
    notify(exists?'Dihapus dari tersimpan.':'Project disimpan ke akun.');
  }

  async function refreshDashboard(){
    try{
      await loadAccountData();
      await loadSaved();
      const stats=await communityStats(account?.member_id);
      $('#plusMessageCount').textContent=String(stats.messages);
      $('#plusReactionCount').textContent=String(stats.reactions);
      renderProfileHealth();
      renderSecurity();
      renderSavedProjects();
      renderDownloadHistory();
      renderActivity(stats);
      renderTheme();

      const bio=$('#profileBio'); if(bio) $('#bioCount').textContent=String((bio.value||'').length);

      const next=new URLSearchParams(location.search).get('next');
      if(next==='project'){
        let target=''; try{target=sessionStorage.getItem(RETURN_KEY)||'';sessionStorage.removeItem(RETURN_KEY);}catch{}
        if(target) setTimeout(()=>location.replace(target),350);
      }
    }catch(error){
      console.warn('[DLavie Account Plus]',error);
      const out=$('#plusActivityList'); if(out)out.innerHTML='<div class="plus-empty"><strong>Data belum bisa dimuat</strong><span>Coba refresh halaman beberapa saat lagi.</span></div>';
    }
  }

  function bind(){
    normalizeExistingFields();
    createClient();

    $('#saveAccountTheme')?.addEventListener('click',async()=>{
      const button=$('#saveAccountTheme');
      try{button.disabled=true;await applyThemePreference($('#accountThemePreference').value,true);notify('Tema tersimpan ke akun.');}
      catch(error){notify(error.message||'Gagal menyimpan tema.');}
      finally{button.disabled=false;}
    });
    $('#accountThemePreference')?.addEventListener('change',e=>applyThemePreference(e.target.value,false));
    $('#plusClearDownloads')?.addEventListener('click',()=>{try{localStorage.removeItem(DOWNLOAD_KEY);}catch{}renderDownloadHistory();notify('Riwayat download perangkat dihapus.');});

    const accountView=$('#accountView');
    if(accountView){
      const observer=new MutationObserver(()=>{if(!accountView.hidden)refreshDashboard();});
      observer.observe(accountView,{attributes:true,attributeFilter:['hidden']});
    }

    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible' && !$('#accountView')?.hidden)refreshDashboard();},{passive:true});
    window.addEventListener('pageshow',()=>{if(!$('#accountView')?.hidden)refreshDashboard();},{passive:true});
    window.addEventListener('storage',e=>{if(e.key===DOWNLOAD_KEY)renderDownloadHistory();});

    setTimeout(()=>{if(!$('#accountView')?.hidden)refreshDashboard();},250);
  }

  injectShell();
  window.DLavieAccountPlus={refresh:refreshDashboard,toggleSaved};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
})();
