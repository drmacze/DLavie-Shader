(() => {
  'use strict';

  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const API=`${SUPABASE_URL}/functions/v1/dlavie-console-pin`;
  const BUCKET='dlavie-project-media';
  const TOKEN_KEY='dlavie.console.pin.session.v1';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const state={token:localStorage.getItem(TOKEN_KEY)||'',projects:[],editing:null,thumbnailFile:null,thumbnailUrl:'',galleryFiles:[],galleryUrls:[],slugTouched:false,bound:false};
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const slugify=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
  const csv=s=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i);
  const cleanRepo=value=>{let v=String(value||'').trim().replace(/^https?:\/\/github\.com\//i,'').replace(/\.git$/i,'').replace(/^\/+|\/+$/g,'');if(v.includes('/tree/'))v=v.split('/tree/')[0];return v.split('/').slice(0,2).join('/')};
  const publicUrl=path=>sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  function toast(msg){const el=$('#devToast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
  function setGate(msg,bad=false){const m=$('#gateMessage');if(m){m.textContent=msg;m.classList.toggle('bad',bad)}}
  function showGate(msg='Masukkan PIN tim DLavie.'){state.token='';localStorage.removeItem(TOKEN_KEY);$('#accessGate').hidden=false;$('#consoleApp').hidden=true;setGate(msg,false);setTimeout(()=>$('#consolePin')?.focus(),80)}
  function showConsole(){$('#accessGate').hidden=true;$('#consoleApp').hidden=false;$('#devDisplay').textContent='DLavie Team';$('#welcomeName').textContent='Tim DLavie';$('#devRole').textContent='PIN ACCESS'}
  function panel(name){$$('[data-console-panel]').forEach(x=>x.classList.toggle('active',x.dataset.consolePanel===name));$$('[data-panel]').forEach(x=>x.classList.toggle('active',x.dataset.panel===name));window.scrollTo(0,0)}
  function imageSrc(url){if(!url)return 'assets/dlavie-mark.svg?v=76';return /^https?:\/\//.test(url)?url:url.replace(/^\//,'')}

  async function api(action,payload={},token=state.token){
    const headers={'Content-Type':'application/json'};
    if(token)headers['x-dlavie-console-token']=token;
    const res=await fetch(API,{method:'POST',headers,body:JSON.stringify({action,...payload})});
    const json=await res.json().catch(()=>({ok:false,error:`HTTP ${res.status}`}));
    if(!res.ok||!json.ok){
      if(res.status===401&&action!=='login')showGate('Sesi PIN berakhir. Masukkan PIN lagi.');
      throw new Error(json.error||'Request gagal');
    }
    return json;
  }

  async function unlock(pin){
    const button=$('#pinSubmit');button.disabled=true;setGate('Memeriksa PIN…');
    try{
      const data=await api('login',{pin},'');
      state.token=data.token;localStorage.setItem(TOKEN_KEY,data.token);
      await enterConsole();
    }catch(e){setGate(e.message==='PIN_SALAH'?'PIN salah. Coba lagi.':e.message,true);$('#consolePin').value='';$('#consolePin').focus()}
    finally{button.disabled=false}
  }

  async function enterConsole(){
    showConsole();
    if(!state.bound)bindConsole();
    try{await loadProjects()}catch(e){toast(e.message)}
  }

  async function boot(){
    $('#pinForm')?.addEventListener('submit',e=>{e.preventDefault();const pin=$('#consolePin').value.trim();if(pin)unlock(pin)});
    $('#lockConsole')?.addEventListener('click',async()=>{try{if(state.token)await api('logout')}catch(_){}showGate()});
    if(!state.token){showGate();return}
    try{await api('verify');await enterConsole()}catch(_){showGate()}
  }

  function bindConsole(){
    state.bound=true;
    $$('[data-panel]').forEach(b=>b.addEventListener('click',()=>panel(b.dataset.panel)));
    $$('[data-new-project]').forEach(b=>b.addEventListener('click',newProject));
    $('#projectName')?.addEventListener('input',()=>{if(!state.slugTouched)$('#projectSlug').value=slugify($('#projectName').value);updatePreview();markDirty()});
    $('#projectSlug')?.addEventListener('input',()=>{state.slugTouched=true;$('#projectSlug').value=slugify($('#projectSlug').value);markDirty()});
    $('#projectSummary')?.addEventListener('input',()=>{$('#summaryCount').textContent=$('#projectSummary').value.length;updatePreview();markDirty()});
    $('#projectDescription')?.addEventListener('input',markDirty);
    $('#projectVersion')?.addEventListener('input',markDirty);
    $('#minecraftVersions')?.addEventListener('input',markDirty);
    $('#platformBedrock')?.addEventListener('change',markDirty);$('#platformJava')?.addEventListener('change',markDirty);
    $('#projectTags')?.addEventListener('input',()=>{updatePreview();markDirty()});
    $('#githubRepo')?.addEventListener('input',markDirty);$('#githubBranch')?.addEventListener('input',markDirty);
    $('#projectFeatured')?.addEventListener('change',markDirty);$('#projectSort')?.addEventListener('input',markDirty);
    $('#thumbnailFile')?.addEventListener('change',e=>setThumbnail(e.target.files?.[0]||null));
    $('#removeThumbnail')?.addEventListener('click',()=>setThumbnail(null,true));
    const drop=$('#thumbnailDrop');if(drop){['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag')}));['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('drag')}));drop.addEventListener('drop',e=>{const f=e.dataTransfer.files?.[0];if(f)setThumbnail(f)})}
    $('#galleryFiles')?.addEventListener('change',e=>addGalleryFiles([...e.target.files]));
    $('#checkBranch')?.addEventListener('click',checkBranch);
    $('#saveDraft')?.addEventListener('click',()=>save('draft'));
    $('#publishProject')?.addEventListener('click',()=>save('published'));
    $('#projectAdminSearch')?.addEventListener('input',renderAllProjects);$('#projectStatusFilter')?.addEventListener('change',renderAllProjects);
    window.addEventListener('beforeunload',e=>{if($('#saveState')?.dataset.dirty==='1'){e.preventDefault();e.returnValue=''}});
  }
  function markDirty(){const s=$('#saveState');if(!s)return;s.textContent='Perubahan belum disimpan';s.dataset.dirty='1'}
  function markSaved(text='Tersimpan'){const s=$('#saveState');if(!s)return;s.textContent=text;s.dataset.dirty='0'}

  async function loadProjects(){const data=await api('list_projects');state.projects=data.projects||[];renderMetrics();renderRecent();renderAllProjects()}
  function renderMetrics(){const p=state.projects;$('#metricPublished').textContent=p.filter(x=>x.status==='published').length;$('#metricDraft').textContent=p.filter(x=>x.status==='draft').length;$('#metricTotal').textContent=p.length;$('#metricFeatured').textContent=p.filter(x=>x.featured).length}
  function rowHtml(p){return `<article class="project-admin-row" data-edit-project="${esc(p.id)}"><img src="${esc(imageSrc(p.thumbnail_url))}" alt=""><div class="project-admin-copy"><strong>${esc(p.name||'Tanpa nama')}</strong><p>${esc(p.summary||p.slug)}</p></div><div class="row-meta"><span class="status-chip ${esc(p.status)}">${esc(p.status)}</span><b>${esc(p.version||'—')}</b></div></article>`}
  function hookRows(root){$$('[data-edit-project]',root).forEach(el=>el.addEventListener('click',()=>editProject(el.dataset.editProject)))}
  function renderRecent(){const root=$('#recentProjects');const rows=state.projects.slice(0,5);root.innerHTML=rows.length?rows.map(rowHtml).join(''):'<div class="empty-admin">Belum ada project.</div>';hookRows(root)}
  function renderAllProjects(){const root=$('#allProjects'),q=$('#projectAdminSearch').value.trim().toLowerCase(),status=$('#projectStatusFilter').value;const rows=state.projects.filter(p=>(status==='all'||p.status===status)&&(!q||`${p.name} ${p.slug} ${(p.tags||[]).join(' ')}`.toLowerCase().includes(q)));root.innerHTML=rows.length?rows.map(rowHtml).join(''):'<div class="empty-admin">Tidak ada project yang cocok.</div>';hookRows(root)}

  function resetForm(){state.editing=null;state.thumbnailFile=null;state.thumbnailUrl='';state.galleryFiles=[];state.galleryUrls=[];state.slugTouched=false;$('#projectForm').reset();$('#projectId').value='';$('#githubBranch').value='main';$('#projectSort').value='100';$('#summaryCount').textContent='0';setThumbnail(null,true,false);renderGallery();updatePreview();markSaved('Project baru')}
  function newProject(){resetForm();panel('editor');$('#projectName').focus()}
  function editProject(id){const p=state.projects.find(x=>x.id===id);if(!p)return;state.editing=p;state.thumbnailFile=null;state.thumbnailUrl=p.thumbnail_url||'';state.galleryFiles=[];state.galleryUrls=[...(p.gallery_urls||[])];state.slugTouched=true;$('#projectId').value=p.id;$('#projectName').value=p.name||'';$('#projectSlug').value=p.slug||'';$('#projectSummary').value=p.summary||'';$('#summaryCount').textContent=(p.summary||'').length;$('#projectDescription').value=p.description||'';$('#projectVersion').value=p.version||'';$('#minecraftVersions').value=(p.minecraft_versions||[]).join(', ');$('#platformBedrock').checked=(p.platforms||[]).includes('bedrock');$('#platformJava').checked=(p.platforms||[]).includes('java');$('#projectTags').value=(p.tags||[]).join(', ');$('#githubRepo').value=p.github_repo||'';$('#githubBranch').value=p.github_branch||'main';$('#projectFeatured').checked=!!p.featured;$('#projectSort').value=p.sort_order??100;showThumbnailUrl(p.thumbnail_url||'');renderGallery();updatePreview();markSaved(`Status: ${p.status}`);panel('editor')}
  function showThumbnailUrl(url){const img=$('#thumbnailPreview'),empty=$('#thumbnailEmpty'),remove=$('#removeThumbnail');if(url){img.src=imageSrc(url);img.hidden=false;empty.hidden=true;remove.hidden=false}else{img.hidden=true;img.removeAttribute('src');empty.hidden=false;remove.hidden=true}}
  function setThumbnail(file,clear=false,dirty=true){if(clear){state.thumbnailFile=null;state.thumbnailUrl='';if($('#thumbnailFile'))$('#thumbnailFile').value='';showThumbnailUrl('');updatePreview();if(dirty)markDirty();return}if(!file)return;if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)){toast('Format thumbnail tidak didukung');return}if(file.size>8*1024*1024){toast('Thumbnail maksimal 8 MB');return}state.thumbnailFile=file;showThumbnailUrl(URL.createObjectURL(file));updatePreview();markDirty()}
  function addGalleryFiles(files){for(const file of files){if(state.galleryFiles.length+state.galleryUrls.length>=8)break;if(/^image\/(png|jpeg|webp|gif)$/.test(file.type)&&file.size<=8*1024*1024)state.galleryFiles.push(file)}renderGallery();markDirty();$('#galleryFiles').value=''}
  function renderGallery(){const root=$('#galleryPreview');const existing=state.galleryUrls.map((url,i)=>({url:imageSrc(url),type:'url',i}));const local=state.galleryFiles.map((f,i)=>({url:URL.createObjectURL(f),type:'file',i}));root.innerHTML=[...existing,...local].map(x=>`<div class="gallery-item"><img src="${esc(x.url)}" alt=""><button type="button" data-gallery-remove="${x.type}:${x.i}" aria-label="Hapus">×</button></div>`).join('');$$('[data-gallery-remove]',root).forEach(b=>b.addEventListener('click',()=>{const [type,index]=b.dataset.galleryRemove.split(':');if(type==='url')state.galleryUrls.splice(+index,1);else state.galleryFiles.splice(+index,1);renderGallery();markDirty()}))}
  function updatePreview(){if(!$('#cardPreviewName'))return;$('#cardPreviewName').textContent=$('#projectName').value||'Nama project';$('#cardPreviewSummary').textContent=$('#projectSummary').value||'Deskripsi singkat project akan tampil di sini.';const tags=csv($('#projectTags').value).slice(0,3);$('#cardPreviewTags').innerHTML=(tags.length?tags:['Project']).map(x=>`<i>${esc(x)}</i>`).join('');const src=(state.thumbnailFile&&$('#thumbnailPreview').src)||state.thumbnailUrl;$('#cardPreviewImage').src=imageSrc(src||'assets/dlavie-mark.svg?v=76')}

  async function checkBranch(){const repo=cleanRepo($('#githubRepo').value),branch=$('#githubBranch').value.trim();const box=$('#branchState');box.hidden=false;box.className='branch-state';if(!/^[\w.-]+\/[\w.-]+$/.test(repo)||!branch){box.textContent='Isi repository owner/repo dan branch terlebih dahulu.';box.classList.add('error');return false}$('#githubRepo').value=repo;box.textContent='Memeriksa branch GitHub…';try{const r=await fetch(`https://api.github.com/repos/${repo}/branches/${encodeURIComponent(branch)}`,{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw new Error(r.status===404?'Repository atau branch tidak ditemukan':`GitHub API ${r.status}`);const j=await r.json();box.textContent=`Branch ditemukan · ${j.name} · commit ${String(j.commit?.sha||'').slice(0,7)}`;box.classList.add('ok');return true}catch(e){box.textContent=e.message;box.classList.add('error');return false}}

  async function uploadFile(file,slug,kind){
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');const safe=slugify(file.name.replace(/\.[^.]+$/,''))||kind;const path=`projects/${slug}/${kind}-${Date.now()}-${safe}.${ext}`;
    const signed=await api('create_upload',{path,content_type:file.type});
    const {error}=await sb.storage.from(BUCKET).uploadToSignedUrl(signed.path,signed.token,file,{contentType:file.type,cacheControl:'31536000'});if(error)throw error;
    return signed.public_url||publicUrl(path);
  }
  function payload(status){const platforms=[];if($('#platformBedrock').checked)platforms.push('bedrock');if($('#platformJava').checked)platforms.push('java');return {slug:slugify($('#projectSlug').value),name:$('#projectName').value.trim(),summary:$('#projectSummary').value.trim(),description:$('#projectDescription').value.trim(),version:$('#projectVersion').value.trim(),minecraft_versions:csv($('#minecraftVersions').value),platforms,tags:csv($('#projectTags').value),github_repo:cleanRepo($('#githubRepo').value),github_branch:$('#githubBranch').value.trim()||'main',thumbnail_url:state.thumbnailUrl||null,gallery_urls:state.galleryUrls,featured:$('#projectFeatured').checked,status,sort_order:Number($('#projectSort').value)||100}}
  function validate(p,status){if(!p.slug||!p.name)return 'Nama dan slug wajib diisi.';if(status==='published'){if(!p.summary||!p.description)return 'Deskripsi singkat dan lengkap wajib diisi sebelum publish.';if(!p.minecraft_versions.length)return 'Isi minimal satu versi Minecraft.';if(!p.platforms.length)return 'Pilih Bedrock atau Java.';if(!p.github_repo||!p.github_branch)return 'Repository dan branch GitHub wajib diisi.'}return ''}
  async function save(status){const draft=payload(status),err=validate(draft,status);if(err){toast(err);return}const btn=status==='published'?$('#publishProject'):$('#saveDraft');btn.disabled=true;markSaved('Mengunggah…');try{if(state.thumbnailFile){draft.thumbnail_url=await uploadFile(state.thumbnailFile,draft.slug,'thumbnail');state.thumbnailUrl=draft.thumbnail_url;state.thumbnailFile=null}if(state.galleryFiles.length){for(const file of state.galleryFiles)state.galleryUrls.push(await uploadFile(file,draft.slug,'gallery'));state.galleryFiles=[];draft.gallery_urls=state.galleryUrls}const result=await api('save_project',{id:state.editing?.id||null,project:draft});state.editing=result.project;state.thumbnailUrl=result.project.thumbnail_url||'';state.galleryUrls=[...(result.project.gallery_urls||[])];showThumbnailUrl(state.thumbnailUrl);renderGallery();markSaved(status==='published'?'Published':'Draft tersimpan');toast(status==='published'?'Project berhasil dipublish':'Draft berhasil disimpan');await loadProjects()}catch(e){markDirty();toast(e.message||'Gagal menyimpan project')}finally{btn.disabled=false}}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();