(() => {
  'use strict';

  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const PIN_ENDPOINT=`${SUPABASE_URL}/functions/v1/dlavie-console-pin`;
  const MEDIA_BUCKET='dlavie-project-media';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const state={projects:[],editing:null,thumbnailFile:null,thumbnailUrl:'',galleryFiles:[],galleryUrls:[],slugTouched:false,teamSearchTimer:null};

  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const slugify=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
  const csv=s=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i);
  const cleanRepo=value=>{let v=String(value||'').trim().replace(/^https?:\/\/github\.com\//i,'').replace(/\.git$/i,'').replace(/^\/+|\/+$/g,'');if(v.includes('/tree/'))v=v.split('/tree/')[0];return v.split('/').slice(0,2).join('/')};
  const imageSrc=url=>url||'assets/dlavie-mark.svg?v=74';
  const publicUrl=path=>sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;

  function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
  function showGate(message=''){ $('#pinGate').hidden=false; $('#consoleApp').hidden=true; $('#consoleLogout').hidden=true; $('#pinMessage').textContent=message; setTimeout(()=>$('#consolePin')?.focus(),60); }
  function showConsole(){ $('#pinGate').hidden=true; $('#consoleApp').hidden=false; $('#consoleLogout').hidden=false; }
  function setPanel(name){$$('[data-console-panel]').forEach(p=>p.classList.toggle('active',p.dataset.consolePanel===name));$$('[data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel===name));window.scrollTo({top:0,behavior:'instant'})}

  async function checkConsoleAccess(){
    const {data:{session}}=await sb.auth.getSession();
    if(!session)return false;
    const {data,error}=await sb.rpc('dlavie_console_access_role');
    return !error&&data==='owner';
  }

  async function enterConsole(){
    const ok=await checkConsoleAccess();
    if(!ok){showGate();return false}
    showConsole();bindWorkspace();await loadProjects();await loadTeam();return true;
  }

  async function submitPin(e){
    e.preventDefault();
    const pin=$('#consolePin').value.trim();
    if(!/^\d{6}$/.test(pin)){ $('#pinMessage').textContent='PIN harus 6 digit.'; return; }
    const btn=$('#pinSubmit');btn.disabled=true;btn.textContent='Memeriksa…';$('#pinMessage').textContent='';
    try{
      const res=await fetch(PIN_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify({pin})});
      const body=await res.json().catch(()=>({}));
      if(!res.ok){
        if(res.status===429)throw new Error('Terlalu banyak percobaan. Coba lagi beberapa menit.');
        throw new Error('PIN salah.');
      }
      const {error}=await sb.auth.setSession({access_token:body.access_token,refresh_token:body.refresh_token});
      if(error)throw error;
      $('#consolePin').value='';
      if(!await enterConsole())throw new Error('Sesi console gagal dibuat.');
      toast('Developer Console terbuka');
    }catch(err){$('#pinMessage').textContent=err.message||'Tidak dapat membuka console.'}
    finally{btn.disabled=false;btn.textContent='Buka Console'}
  }

  async function logout(){await sb.auth.signOut({scope:'local'});showGate('Console dikunci. Masukkan PIN untuk masuk lagi.');}

  let workspaceBound=false;
  function bindWorkspace(){
    if(workspaceBound)return;workspaceBound=true;
    $$('[data-panel]').forEach(b=>b.addEventListener('click',()=>setPanel(b.dataset.panel)));
    $$('[data-new-project]').forEach(b=>b.addEventListener('click',newProject));
    $('#projectSearch').addEventListener('input',renderProjects);
    $('#projectStatus').addEventListener('change',renderProjects);
    $('#projectName').addEventListener('input',()=>{if(!state.slugTouched)$('#projectSlug').value=slugify($('#projectName').value);updatePreview();markDirty()});
    $('#projectSlug').addEventListener('input',()=>{state.slugTouched=true;$('#projectSlug').value=slugify($('#projectSlug').value);markDirty()});
    $('#projectSummary').addEventListener('input',()=>{$('#summaryCount').textContent=$('#projectSummary').value.length;updatePreview();markDirty()});
    $('#projectDescription').addEventListener('input',markDirty);$('#projectVersion').addEventListener('input',markDirty);$('#minecraftVersions').addEventListener('input',markDirty);$('#projectTags').addEventListener('input',()=>{updatePreview();markDirty()});
    $('#platformBedrock').addEventListener('change',markDirty);$('#platformJava').addEventListener('change',markDirty);$('#githubRepo').addEventListener('input',markDirty);$('#githubBranch').addEventListener('input',markDirty);$('#projectFeatured').addEventListener('change',markDirty);$('#projectSort').addEventListener('input',markDirty);
    $('#thumbnailFile').addEventListener('change',e=>setThumbnail(e.target.files?.[0]||null));
    $('#removeThumbnail').addEventListener('click',()=>clearThumbnail());
    const drop=$('#thumbnailDrop');
    ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.style.borderColor='#22c968'}));
    ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.style.borderColor=''}));
    drop.addEventListener('drop',e=>{const f=e.dataTransfer.files?.[0];if(f)setThumbnail(f)});
    $('#galleryFiles').addEventListener('change',e=>addGalleryFiles([...e.target.files]));
    $('#checkBranch').addEventListener('click',checkBranch);
    $('#saveDraft').addEventListener('click',()=>saveProject('draft'));
    $('#publishProject').addEventListener('click',()=>saveProject('published'));
    $('#teamSearch').addEventListener('input',()=>{clearTimeout(state.teamSearchTimer);state.teamSearchTimer=setTimeout(searchTeam,260)});
    $('#refreshTeam').addEventListener('click',loadTeam);
  }

  function markDirty(){const s=$('#saveState');s.textContent='Perubahan belum disimpan';s.dataset.dirty='1'}
  function markSaved(text='Tersimpan'){const s=$('#saveState');s.textContent=text;s.dataset.dirty='0'}

  async function loadProjects(){
    const {data,error}=await sb.from('dlavie_projects').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
    if(error){toast('Gagal memuat project');return}
    state.projects=data||[];renderMetrics();renderRecent();renderProjects();
  }
  function renderMetrics(){const p=state.projects;$('#metricPublished').textContent=p.filter(x=>x.status==='published').length;$('#metricDraft').textContent=p.filter(x=>x.status==='draft').length;$('#metricTotal').textContent=p.length;$('#metricFeatured').textContent=p.filter(x=>x.featured).length}
  function projectRow(p){return `<article class="project-row" data-project-id="${esc(p.id)}"><img src="${esc(imageSrc(p.thumbnail_url))}" alt=""><div class="project-copy"><strong>${esc(p.name||'Tanpa nama')}</strong><p>${esc(p.summary||p.slug||'')}</p></div><div class="project-meta"><span class="status-chip ${esc(p.status)}">${esc(p.status)}</span><b>${esc(p.version||'—')}</b></div></article>`}
  function hookProjectRows(root){$$('[data-project-id]',root).forEach(row=>row.addEventListener('click',()=>editProject(row.dataset.projectId)))}
  function renderRecent(){const root=$('#recentProjects'),rows=state.projects.slice(0,5);root.innerHTML=rows.length?rows.map(projectRow).join(''):'<div class="empty">Belum ada project.</div>';hookProjectRows(root)}
  function renderProjects(){const root=$('#projectList'),q=$('#projectSearch').value.trim().toLowerCase(),status=$('#projectStatus').value;const rows=state.projects.filter(p=>(status==='all'||p.status===status)&&(!q||`${p.name} ${p.slug} ${(p.tags||[]).join(' ')}`.toLowerCase().includes(q)));root.innerHTML=rows.length?rows.map(projectRow).join(''):'<div class="empty">Tidak ada project yang cocok.</div>';hookProjectRows(root)}

  function resetForm(){
    state.editing=null;state.thumbnailFile=null;state.thumbnailUrl='';state.galleryFiles=[];state.galleryUrls=[];state.slugTouched=false;
    $('#projectForm').reset();$('#projectId').value='';$('#githubBranch').value='main';$('#projectSort').value='100';$('#summaryCount').textContent='0';
    showThumbnail('');renderGallery();updatePreview();markSaved('Project baru');
  }
  function newProject(){resetForm();setPanel('editor');setTimeout(()=>$('#projectName').focus(),40)}
  function editProject(id){
    const p=state.projects.find(x=>x.id===id);if(!p)return;
    state.editing=p;state.thumbnailFile=null;state.thumbnailUrl=p.thumbnail_url||'';state.galleryFiles=[];state.galleryUrls=[...(p.gallery_urls||[])];state.slugTouched=true;
    $('#projectId').value=p.id;$('#projectName').value=p.name||'';$('#projectSlug').value=p.slug||'';$('#projectSummary').value=p.summary||'';$('#summaryCount').textContent=(p.summary||'').length;$('#projectDescription').value=p.description||'';$('#projectVersion').value=p.version||'';$('#minecraftVersions').value=(p.minecraft_versions||[]).join(', ');$('#platformBedrock').checked=(p.platforms||[]).includes('bedrock');$('#platformJava').checked=(p.platforms||[]).includes('java');$('#projectTags').value=(p.tags||[]).join(', ');$('#githubRepo').value=p.github_repo||'';$('#githubBranch').value=p.github_branch||'main';$('#projectFeatured').checked=!!p.featured;$('#projectSort').value=p.sort_order??100;
    showThumbnail(state.thumbnailUrl);renderGallery();updatePreview();markSaved(`Status: ${p.status}`);setPanel('editor');
  }
  function validImage(file){return /^image\/(png|jpeg|webp|gif)$/.test(file.type)&&file.size<=8*1024*1024}
  function showThumbnail(url){const img=$('#thumbnailPreview'),empty=$('#thumbnailEmpty'),remove=$('#removeThumbnail');if(url){img.src=url;img.hidden=false;empty.hidden=true;remove.hidden=false}else{img.hidden=true;img.removeAttribute('src');empty.hidden=false;remove.hidden=true}}
  function setThumbnail(file){if(!file)return;if(!validImage(file)){toast('Thumbnail harus PNG/JPG/WebP/GIF dan maksimal 8 MB');return}state.thumbnailFile=file;showThumbnail(URL.createObjectURL(file));updatePreview();markDirty()}
  function clearThumbnail(){state.thumbnailFile=null;state.thumbnailUrl='';$('#thumbnailFile').value='';showThumbnail('');updatePreview();markDirty()}
  function addGalleryFiles(files){for(const file of files){if(state.galleryFiles.length+state.galleryUrls.length>=8)break;if(validImage(file))state.galleryFiles.push(file)}$('#galleryFiles').value='';renderGallery();markDirty()}
  function renderGallery(){const root=$('#galleryPreview');const items=[...state.galleryUrls.map((u,i)=>({url:u,type:'url',i})),...state.galleryFiles.map((f,i)=>({url:URL.createObjectURL(f),type:'file',i}))];root.innerHTML=items.map(x=>`<div class="gallery-item"><img src="${esc(x.url)}" alt=""><button type="button" data-remove-gallery="${x.type}:${x.i}">×</button></div>`).join('');$$('[data-remove-gallery]',root).forEach(b=>b.addEventListener('click',()=>{const [type,i]=b.dataset.removeGallery.split(':');if(type==='url')state.galleryUrls.splice(+i,1);else state.galleryFiles.splice(+i,1);renderGallery();markDirty()}))}
  function updatePreview(){const name=$('#projectName').value||'Nama project',summary=$('#projectSummary').value||'Deskripsi project',tags=csv($('#projectTags').value).slice(0,3);$('#cardPreviewName').textContent=name;$('#cardPreviewSummary').textContent=summary;$('#cardPreviewTags').innerHTML=(tags.length?tags:['Project']).map(t=>`<i>${esc(t)}</i>`).join('');const src=state.thumbnailFile?$('#thumbnailPreview').src:state.thumbnailUrl;$('#cardPreviewImage').src=imageSrc(src)}

  async function checkBranch(){const repo=cleanRepo($('#githubRepo').value),branch=$('#githubBranch').value.trim(),box=$('#branchState');box.hidden=false;box.className='branch-state';if(!/^[\w.-]+\/[\w.-]+$/.test(repo)||!branch){box.textContent='Isi repository owner/repo dan branch.';box.classList.add('error');return false}$('#githubRepo').value=repo;box.textContent='Memeriksa branch GitHub…';try{const r=await fetch(`https://api.github.com/repos/${repo}/branches/${encodeURIComponent(branch)}`,{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw new Error(r.status===404?'Repository atau branch tidak ditemukan':`GitHub API ${r.status}`);const j=await r.json();box.textContent=`Branch ditemukan · ${j.name} · ${String(j.commit?.sha||'').slice(0,7)}`;box.classList.add('ok');return true}catch(e){box.textContent=e.message;box.classList.add('error');return false}}
  async function uploadFile(file,slug,kind){const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');const safe=slugify(file.name.replace(/\.[^.]+$/,''))||kind;const path=`projects/${slug}/${kind}-${Date.now()}-${safe}.${ext}`;const {error}=await sb.storage.from(MEDIA_BUCKET).upload(path,file,{cacheControl:'31536000',upsert:false,contentType:file.type});if(error)throw error;return publicUrl(path)}
  function formPayload(status){const platforms=[];if($('#platformBedrock').checked)platforms.push('bedrock');if($('#platformJava').checked)platforms.push('java');return {slug:slugify($('#projectSlug').value),name:$('#projectName').value.trim(),summary:$('#projectSummary').value.trim(),description:$('#projectDescription').value.trim(),version:$('#projectVersion').value.trim(),minecraft_versions:csv($('#minecraftVersions').value),platforms,tags:csv($('#projectTags').value),github_repo:cleanRepo($('#githubRepo').value),github_branch:$('#githubBranch').value.trim()||'main',thumbnail_url:state.thumbnailUrl||null,gallery_urls:state.galleryUrls,featured:$('#projectFeatured').checked,status,sort_order:Number($('#projectSort').value)||100,updated_by:(awaitUserId.cache||null)}}
  async function awaitUserId(){if(awaitUserId.cache)return awaitUserId.cache;const {data:{user}}=await sb.auth.getUser();awaitUserId.cache=user?.id||null;return awaitUserId.cache}
  function validateProject(p,status){if(!p.name||!p.slug)return 'Nama dan slug wajib diisi.';if(status==='published'){if(!p.summary||!p.description)return 'Isi deskripsi sebelum publish.';if(!p.minecraft_versions.length)return 'Isi versi Minecraft.';if(!p.platforms.length)return 'Pilih Bedrock atau Java.';if(!p.github_repo||!p.github_branch)return 'Isi repository dan branch GitHub.'}return ''}
  async function saveProject(status){
    const userId=await awaitUserId();
    const p={slug:slugify($('#projectSlug').value),name:$('#projectName').value.trim(),summary:$('#projectSummary').value.trim(),description:$('#projectDescription').value.trim(),version:$('#projectVersion').value.trim(),minecraft_versions:csv($('#minecraftVersions').value),platforms:[$('#platformBedrock').checked?'bedrock':null,$('#platformJava').checked?'java':null].filter(Boolean),tags:csv($('#projectTags').value),github_repo:cleanRepo($('#githubRepo').value),github_branch:$('#githubBranch').value.trim()||'main',thumbnail_url:state.thumbnailUrl||null,gallery_urls:state.galleryUrls,featured:$('#projectFeatured').checked,status,sort_order:Number($('#projectSort').value)||100,updated_by:userId};
    const invalid=validateProject(p,status);if(invalid){toast(invalid);return}
    const btn=status==='published'?$('#publishProject'):$('#saveDraft');btn.disabled=true;markSaved('Menyimpan…');
    try{
      if(state.thumbnailFile){p.thumbnail_url=await uploadFile(state.thumbnailFile,p.slug,'thumbnail');state.thumbnailUrl=p.thumbnail_url;state.thumbnailFile=null}
      if(state.galleryFiles.length){for(const f of state.galleryFiles)state.galleryUrls.push(await uploadFile(f,p.slug,'gallery'));state.galleryFiles=[];p.gallery_urls=state.galleryUrls}
      let q;if(state.editing)q=await sb.from('dlavie_projects').update(p).eq('id',state.editing.id).select().single();else q=await sb.from('dlavie_projects').insert(p).select().single();
      if(q.error)throw q.error;state.editing=q.data;state.thumbnailUrl=q.data.thumbnail_url||'';state.galleryUrls=[...(q.data.gallery_urls||[])];showThumbnail(state.thumbnailUrl);renderGallery();markSaved(status==='published'?'Published':'Draft tersimpan');toast(status==='published'?'Project berhasil dipublish':'Draft berhasil disimpan');await loadProjects();
    }catch(err){markDirty();toast(err.message||'Gagal menyimpan project')}finally{btn.disabled=false}
  }

  async function searchTeam(){const q=$('#teamSearch').value.trim(),root=$('#teamSearchResults');if(!q){root.innerHTML='<div class="empty">Ketik username untuk mencari akun.</div>';return}root.innerHTML='<div class="empty">Mencari…</div>';const {data,error}=await sb.rpc('dlavie_search_team_accounts',{search_text:q});if(error){root.innerHTML='<div class="empty">Gagal mencari akun.</div>';return}renderTeamRows(root,data||[])}
  function roleOptions(current){return ['member','editor','developer','owner'].map(r=>`<option value="${r}" ${r===(current||'member')?'selected':''}>${r[0].toUpperCase()+r.slice(1)}</option>`).join('')}
  function renderTeamRows(root,rows){if(!rows.length){root.innerHTML='<div class="empty">Akun tidak ditemukan.</div>';return}root.innerHTML=rows.map(r=>`<article class="team-row"><div class="team-avatar">${esc((r.display_name||r.username||'?').slice(0,1).toUpperCase())}</div><div class="team-copy"><strong>@${esc(r.username||'unknown')}</strong><small>${esc(r.display_name||'Tanpa display name')}</small></div><select data-role-username="${esc(r.username)}">${roleOptions(r.role)}</select><button class="team-save" type="button" data-save-role="${esc(r.username)}">Simpan</button></article>`).join('');$$('[data-save-role]',root).forEach(b=>b.addEventListener('click',()=>saveTeamRole(b.dataset.saveRole,root)))}
  async function saveTeamRole(username,root){const select=root.querySelector(`[data-role-username="${CSS.escape(username)}"]`),role=select?.value||'member';const btn=root.querySelector(`[data-save-role="${CSS.escape(username)}"]`);if(btn){btn.disabled=true;btn.textContent='…'}const {error}=await sb.rpc('dlavie_set_team_role',{target_username:username,target_role:role});if(error)toast(error.message.includes('account_not_found')?'Username tidak ditemukan':'Gagal mengubah role');else{toast(`@${username} → ${role}`);await loadTeam();}if(btn){btn.disabled=false;btn.textContent='Simpan'}}
  async function loadTeam(){const root=$('#developerList');root.innerHTML='<div class="empty">Memuat…</div>';const {data,error}=await sb.rpc('dlavie_developer_team');if(error){root.innerHTML='<div class="empty">Gagal memuat role tim.</div>';return}renderTeamRows(root,(data||[]).map(x=>({...x,role:x.role||'member'})))}

  async function boot(){
    $('#pinForm').addEventListener('submit',submitPin);$('#consoleLogout').addEventListener('click',logout);
    if(await checkConsoleAccess())await enterConsole();else showGate();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
