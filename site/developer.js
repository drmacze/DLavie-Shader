(() => {
  'use strict';
  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const MEDIA_BUCKET='dlavie-project-media';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const state={session:null,access:null,projects:[],editing:null,thumbnailFile:null,thumbnailUrl:'',galleryFiles:[],galleryUrls:[],slugTouched:false};
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const slugify=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
  const csv=s=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i);
  const cleanRepo=value=>{let v=String(value||'').trim().replace(/^https?:\/\/github\.com\//i,'').replace(/\.git$/i,'').replace(/^\/+|\/+$/g,'');if(v.includes('/tree/'))v=v.split('/tree/')[0];return v.split('/').slice(0,2).join('/')};
  const publicUrl=path=>sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  function toast(msg){const el=$('#devToast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
  function setGate(message,actions=true){$('#gateMessage').textContent=message;$('#gateActions').hidden=!actions}
  function showConsole(){$('#accessGate').hidden=true;$('#consoleApp').hidden=false}
  function panel(name){$$('[data-console-panel]').forEach(x=>x.classList.toggle('active',x.dataset.consolePanel===name));$$('[data-panel]').forEach(x=>x.classList.toggle('active',x.dataset.panel===name));window.scrollTo(0,0)}
  function imageSrc(url){if(!url)return 'assets/dlavie-mark.svg?v=69';return /^https?:\/\//.test(url)?url:url.replace(/^\//,'')}

  async function boot(){
    const {data:{session}}=await sb.auth.getSession();state.session=session||null;
    if(!session){setGate('Masuk menggunakan akun DLavie yang memiliki akses developer.',true);return}
    const {data:access,error}=await sb.from('dlavie_developers').select('user_id,role').eq('user_id',session.user.id).maybeSingle();
    if(error){setGate('Tidak dapat memeriksa akses developer. Coba muat ulang halaman.',true);return}
    if(!access){setGate('Akun ini tidak memiliki akses Developer Console.',true);return}
    state.access=access;showConsole();
    const {data:account}=await sb.from('dlavie_accounts').select('username,display_name').eq('user_id',session.user.id).maybeSingle();
    const display=account?.display_name||account?.username||session.user.email?.split('@')[0]||'Developer';
    $('#devDisplay').textContent=display;$('#welcomeName').textContent=display;$('#devRole').textContent=access.role;
    $$('.owner-only').forEach(x=>x.hidden=access.role!=='owner');
    bind();await loadProjects();if(access.role==='owner')await loadDevelopers();
  }

  function bind(){
    $$('[data-panel]').forEach(b=>b.addEventListener('click',()=>panel(b.dataset.panel)));
    $$('[data-new-project]').forEach(b=>b.addEventListener('click',newProject));
    $('#projectName').addEventListener('input',()=>{if(!state.slugTouched)$('#projectSlug').value=slugify($('#projectName').value);updatePreview()});
    $('#projectSlug').addEventListener('input',()=>{state.slugTouched=true;$('#projectSlug').value=slugify($('#projectSlug').value)});
    $('#projectSummary').addEventListener('input',()=>{$('#summaryCount').textContent=$('#projectSummary').value.length;updatePreview()});
    $('#projectTags').addEventListener('input',updatePreview);
    $('#thumbnailFile').addEventListener('change',e=>setThumbnail(e.target.files?.[0]||null));
    $('#removeThumbnail').addEventListener('click',()=>setThumbnail(null,true));
    const drop=$('#thumbnailDrop');['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag')}));['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('drag')}));drop.addEventListener('drop',e=>{const f=e.dataTransfer.files?.[0];if(f)setThumbnail(f)});
    $('#galleryFiles').addEventListener('change',e=>addGalleryFiles([...e.target.files]));
    $('#checkBranch').addEventListener('click',checkBranch);
    $('#saveDraft').addEventListener('click',()=>save('draft'));
    $('#publishProject').addEventListener('click',()=>save('published'));
    $('#projectAdminSearch').addEventListener('input',renderAllProjects);$('#projectStatusFilter').addEventListener('change',renderAllProjects);
    $('#grantDeveloperForm').addEventListener('submit',grantDeveloper);
    window.addEventListener('beforeunload',e=>{if($('#saveState').dataset.dirty==='1'){e.preventDefault();e.returnValue=''}});
    $('#projectForm').addEventListener('input',markDirty);
  }
  function markDirty(){const s=$('#saveState');s.textContent='Perubahan belum disimpan';s.dataset.dirty='1'}
  function markSaved(text='Tersimpan'){const s=$('#saveState');s.textContent=text;s.dataset.dirty='0'}

  async function loadProjects(){
    const {data,error}=await sb.from('dlavie_projects').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
    if(error){toast('Gagal memuat project');return}state.projects=data||[];renderMetrics();renderRecent();renderAllProjects();
  }
  function renderMetrics(){const p=state.projects;$('#metricPublished').textContent=p.filter(x=>x.status==='published').length;$('#metricDraft').textContent=p.filter(x=>x.status==='draft').length;$('#metricTotal').textContent=p.length;$('#metricFeatured').textContent=p.filter(x=>x.featured).length}
  function rowHtml(p){return `<article class="project-admin-row" data-edit-project="${esc(p.id)}"><img src="${esc(imageSrc(p.thumbnail_url))}" alt=""><div class="project-admin-copy"><strong>${esc(p.name||'Tanpa nama')}</strong><p>${esc(p.summary||p.slug)}</p></div><div class="row-meta"><span class="status-chip ${esc(p.status)}">${esc(p.status)}</span><b>${esc(p.version||'—')}</b></div></article>`}
  function hookRows(root){$$('[data-edit-project]',root).forEach(el=>el.addEventListener('click',()=>editProject(el.dataset.editProject)))}
  function renderRecent(){const root=$('#recentProjects');const rows=state.projects.slice(0,5);root.innerHTML=rows.length?rows.map(rowHtml).join(''):'<div class="empty-admin">Belum ada project.</div>';hookRows(root)}
  function renderAllProjects(){const root=$('#allProjects'),q=$('#projectAdminSearch').value.trim().toLowerCase(),status=$('#projectStatusFilter').value;const rows=state.projects.filter(p=>(status==='all'||p.status===status)&&(!q||`${p.name} ${p.slug} ${(p.tags||[]).join(' ')}`.toLowerCase().includes(q)));root.innerHTML=rows.length?rows.map(rowHtml).join(''):'<div class="empty-admin">Tidak ada project yang cocok.</div>';hookRows(root)}

  function resetForm(){state.editing=null;state.thumbnailFile=null;state.thumbnailUrl='';state.galleryFiles=[];state.galleryUrls=[];state.slugTouched=false;$('#projectForm').reset();$('#projectId').value='';$('#githubBranch').value='main';$('#projectSort').value='100';$('#summaryCount').textContent='0';setThumbnail(null,true);renderGallery();updatePreview();markSaved('Project baru')}
  function newProject(){resetForm();panel('editor');$('#projectName').focus()}
  function editProject(id){const p=state.projects.find(x=>x.id===id);if(!p)return;state.editing=p;state.thumbnailFile=null;state.thumbnailUrl=p.thumbnail_url||'';state.galleryFiles=[];state.galleryUrls=[...(p.gallery_urls||[])];state.slugTouched=true;$('#projectId').value=p.id;$('#projectName').value=p.name||'';$('#projectSlug').value=p.slug||'';$('#projectSummary').value=p.summary||'';$('#summaryCount').textContent=(p.summary||'').length;$('#projectDescription').value=p.description||'';$('#projectVersion').value=p.version||'';$('#minecraftVersions').value=(p.minecraft_versions||[]).join(', ');$('#platformBedrock').checked=(p.platforms||[]).includes('bedrock');$('#platformJava').checked=(p.platforms||[]).includes('java');$('#projectTags').value=(p.tags||[]).join(', ');$('#githubRepo').value=p.github_repo||'';$('#githubBranch').value=p.github_branch||'main';$('#projectFeatured').checked=!!p.featured;$('#projectSort').value=p.sort_order??100;showThumbnailUrl(p.thumbnail_url||'');renderGallery();updatePreview();markSaved(`Status: ${p.status}`);panel('editor')}
  function showThumbnailUrl(url){const img=$('#thumbnailPreview'),empty=$('#thumbnailEmpty'),remove=$('#removeThumbnail');if(url){img.src=imageSrc(url);img.hidden=false;empty.hidden=true;remove.hidden=false}else{img.hidden=true;img.removeAttribute('src');empty.hidden=false;remove.hidden=true}}
  function setThumbnail(file,clear=false){if(clear){state.thumbnailFile=null;state.thumbnailUrl='';$('#thumbnailFile').value='';showThumbnailUrl('');updatePreview();markDirty();return}if(!file)return;if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)){toast('Format thumbnail tidak didukung');return}if(file.size>8*1024*1024){toast('Thumbnail maksimal 8 MB');return}state.thumbnailFile=file;const url=URL.createObjectURL(file);showThumbnailUrl(url);updatePreview(url);markDirty()}
  function addGalleryFiles(files){for(const file of files){if(state.galleryFiles.length+state.galleryUrls.length>=8)break;if(/^image\/(png|jpeg|webp|gif)$/.test(file.type)&&file.size<=8*1024*1024)state.galleryFiles.push(file)}renderGallery();markDirty();$('#galleryFiles').value=''}
  function renderGallery(){const root=$('#galleryPreview');const existing=state.galleryUrls.map((url,i)=>({url:imageSrc(url),type:'url',i}));const local=state.galleryFiles.map((f,i)=>({url:URL.createObjectURL(f),type:'file',i}));root.innerHTML=[...existing,...local].map(x=>`<div class="gallery-item"><img src="${esc(x.url)}" alt=""><button type="button" data-gallery-remove="${x.type}:${x.i}" aria-label="Hapus">×</button></div>`).join('');$$('[data-gallery-remove]',root).forEach(b=>b.addEventListener('click',()=>{const [type,index]=b.dataset.galleryRemove.split(':');if(type==='url')state.galleryUrls.splice(+index,1);else state.galleryFiles.splice(+index,1);renderGallery();markDirty()}))}
  function updatePreview(tempThumb){$('#cardPreviewName').textContent=$('#projectName').value||'Nama project';$('#cardPreviewSummary').textContent=$('#projectSummary').value||'Deskripsi singkat project akan tampil di sini.';const tags=csv($('#projectTags').value).slice(0,3);$('#cardPreviewTags').innerHTML=(tags.length?tags:['Project']).map(x=>`<i>${esc(x)}</i>`).join('');const src=tempThumb||(state.thumbnailFile&&$('#thumbnailPreview').src)||state.thumbnailUrl;$('#cardPreviewImage').src=imageSrc(src||'assets/dlavie-mark.svg?v=69')}

  async function checkBranch(){const repo=cleanRepo($('#githubRepo').value),branch=$('#githubBranch').value.trim();const box=$('#branchState');box.hidden=false;box.className='branch-state';if(!/^[\w.-]+\/[\w.-]+$/.test(repo)||!branch){box.textContent='Isi repository owner/repo dan branch terlebih dahulu.';box.classList.add('error');return false}$('#githubRepo').value=repo;box.textContent='Memeriksa branch GitHub…';try{const r=await fetch(`https://api.github.com/repos/${repo}/branches/${encodeURIComponent(branch)}`,{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw new Error(r.status===404?'Repository atau branch tidak ditemukan':`GitHub API ${r.status}`);const j=await r.json();box.textContent=`Branch ditemukan · ${j.name} · commit ${String(j.commit?.sha||'').slice(0,7)}`;box.classList.add('ok');return true}catch(e){box.textContent=e.message;box.classList.add('error');return false}}
  async function uploadFile(file,slug,kind){const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');const safe=slugify(file.name.replace(/\.[^.]+$/,''))||kind;const path=`projects/${slug}/${kind}-${Date.now()}-${safe}.${ext}`;const {error}=await sb.storage.from(MEDIA_BUCKET).upload(path,file,{cacheControl:'31536000',upsert:false,contentType:file.type});if(error)throw error;return publicUrl(path)}
  function payload(status){const platforms=[];if($('#platformBedrock').checked)platforms.push('bedrock');if($('#platformJava').checked)platforms.push('java');return {slug:slugify($('#projectSlug').value),name:$('#projectName').value.trim(),summary:$('#projectSummary').value.trim(),description:$('#projectDescription').value.trim(),version:$('#projectVersion').value.trim(),minecraft_versions:csv($('#minecraftVersions').value),platforms,tags:csv($('#projectTags').value),github_repo:cleanRepo($('#githubRepo').value),github_branch:$('#githubBranch').value.trim()||'main',thumbnail_url:state.thumbnailUrl||null,gallery_urls:state.galleryUrls,featured:$('#projectFeatured').checked,status,sort_order:Number($('#projectSort').value)||100}}
  function validate(p,status){if(!p.slug||!p.name)return 'Nama dan slug wajib diisi.';if(status==='published'){if(!p.summary||!p.description)return 'Deskripsi singkat dan lengkap wajib diisi sebelum publish.';if(!p.minecraft_versions.length)return 'Isi minimal satu versi Minecraft.';if(!p.platforms.length)return 'Pilih Bedrock atau Java.';if(!p.github_repo||!p.github_branch)return 'Repository dan branch GitHub wajib diisi.'}return ''}
  async function save(status){const draft=payload(status),err=validate(draft,status);if(err){toast(err);return}const btn=status==='published'?$('#publishProject'):$('#saveDraft');btn.disabled=true;markSaved('Mengunggah…');try{if(state.thumbnailFile){draft.thumbnail_url=await uploadFile(state.thumbnailFile,draft.slug,'thumbnail');state.thumbnailUrl=draft.thumbnail_url;state.thumbnailFile=null}if(state.galleryFiles.length){for(const file of state.galleryFiles)state.galleryUrls.push(await uploadFile(file,draft.slug,'gallery'));state.galleryFiles=[];draft.gallery_urls=state.galleryUrls}let result;if(state.editing){result=await sb.from('dlavie_projects').update(draft).eq('id',state.editing.id).select().single()}else{result=await sb.from('dlavie_projects').insert(draft).select().single()}if(result.error)throw result.error;state.editing=result.data;state.thumbnailUrl=result.data.thumbnail_url||'';state.galleryUrls=[...(result.data.gallery_urls||[])];showThumbnailUrl(state.thumbnailUrl);renderGallery();markSaved(status==='published'?'Published':'Draft tersimpan');toast(status==='published'?'Project berhasil dipublish':'Draft berhasil disimpan');await loadProjects()}catch(e){markDirty();toast(e.message||'Gagal menyimpan project')}finally{btn.disabled=false}}

  async function grantDeveloper(e){e.preventDefault();if(state.access?.role!=='owner')return;const username=$('#grantUsername').value.trim().replace(/^@/,'').toLowerCase(),role=$('#grantRole').value;const b=e.currentTarget.querySelector('button');b.disabled=true;try{const {error}=await sb.rpc('dlavie_grant_developer',{target_username:username,target_role:role});if(error)throw error;toast(`@${username} sekarang ${role}`);e.currentTarget.reset();await loadDevelopers()}catch(err){toast(err.message.includes('account_not_found')?'Username akun DLavie tidak ditemukan':err.message)}finally{b.disabled=false}}
  async function loadDevelopers(){if(state.access?.role!=='owner')return;const {data,error}=await sb.from('dlavie_developers').select('user_id,role,created_at').order('created_at');const root=$('#developerList');if(error){root.innerHTML='<div class="empty-admin">Tidak dapat memuat daftar developer.</div>';return}root.innerHTML=(data||[]).map(d=>`<div class="developer-row"><div><strong>${d.user_id===state.session.user.id?'Akun kamu':esc(d.user_id.slice(0,8)+'…')}</strong><span> · ${new Date(d.created_at).toLocaleDateString('id-ID')}</span></div><span>${esc(d.role)}</span></div>`).join('')||'<div class="empty-admin">Belum ada anggota.</div>'}
  boot().catch(e=>{console.error(e);setGate('Developer Console gagal dimuat. Coba muat ulang halaman.',true)});
})();