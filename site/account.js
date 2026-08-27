(() => {
  'use strict';

  const SUPABASE_URL = 'https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const ACCOUNT_API = `${SUPABASE_URL}/functions/v1/dlavie-account`;
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const state = { session:null, data:null, authMode:'login', usernameTimer:null, recovery:false };

  const accountUrl = (params='') => `${location.origin}${location.pathname}${params}`;
  const nextTarget = () => new URLSearchParams(location.search).get('next') === 'community' ? 'community.html' : null;
  const cleanUsername = v => String(v||'').toLowerCase().replace(/[^a-z0-9_]+/g,'').slice(0,24);
  const initials = name => String(name||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase() || '?';

  function toast(message){ const el=$('#accountToast'); if(!el)return; el.textContent=message; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2200); }
  function message(text,type=''){ const el=$('#authMessage'); if(!el)return; el.hidden=!text; el.textContent=text||''; el.className=`auth-message${type?' '+type:''}`; }
  function setBusy(form,busy){ const b=form?.querySelector('button[type="submit"]'); if(b){b.disabled=busy; b.dataset.oldText ||= b.textContent; b.textContent=busy?'Please wait…':b.dataset.oldText;} }

  async function currentSession(){
    if(state.session) return state.session;
    const {data:{session}}=await sb.auth.getSession();
    state.session=session||null;
    return state.session;
  }

  async function accountApi(action,payload={}){
    const session=await currentSession();
    if(!session) throw new Error('Please sign in first.');
    const res = await fetch(ACCOUNT_API,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({action,...payload})});
    const json = await res.json().catch(()=>({}));
    if(!res.ok || !json.ok){ const e=new Error(json?.error?.message||`Request failed (${res.status})`); e.code=json?.error?.code; throw e; }
    return json.data;
  }

  function setAuthMode(mode){
    state.authMode=mode;
    $$('#authTabs [data-auth-tab]').forEach(b=>b.classList.toggle('active',b.dataset.authTab===mode));
    $('#authTabs').hidden = ['reset-request','reset-password'].includes(mode);
    $('#loginForm').hidden = mode!=='login';
    $('#registerForm').hidden = mode!=='register';
    $('#resetRequestForm').hidden = mode!=='reset-request';
    $('#resetPasswordForm').hidden = mode!=='reset-password';
    message('');
  }

  function passwordScore(p){
    let score=0; if(p.length>=10)score++; if(p.length>=14)score++; if(/[A-Z]/.test(p)&&/[a-z]/.test(p))score++; if(/\d/.test(p))score++; if(/[^A-Za-z0-9]/.test(p))score++;
    return Math.min(4,score);
  }
  function renderStrength(){ const p=$('#registerPassword').value,score=passwordScore(p),bar=$('#passwordStrength'); const widths=['0%','25%','50%','75%','100%']; const colors=['#777','#ff7a95','#f4c94c','#79c7ff','#57df9b']; bar.style.width=widths[score]; bar.style.background=colors[score]; }

  async function checkUsername(input,statusEl){
    const username=cleanUsername(input.value); input.value=username;
    if(username.length<3){statusEl.textContent='3–24 lowercase letters, numbers, or underscore.'; statusEl.style.color=''; return false;}
    statusEl.textContent='Checking…'; statusEl.style.color='';
    const {data,error}=await sb.rpc('dlavie_username_available',{candidate:username});
    if(error){statusEl.textContent='Could not check right now.'; return false;}
    statusEl.textContent=data?'Available':'Not available'; statusEl.style.color=data?'#79e6ad':'#ff92a7'; return !!data;
  }

  function avatarStyle(seed='dlavie'){
    let h=0; for(const c of seed)h=((h<<5)-h+c.charCodeAt(0))|0;
    const pairs=[['#3ab7f4','#3157d8'],['#ff4f8f','#8e3ce8'],['#f4c94c','#ed7e39'],['#23d778','#168e62'],['#a7b0ff','#5a61d5'],['#ff8b68','#c94d5b']]; return pairs[Math.abs(h)%pairs.length];
  }

  async function loadAccount(){
    const data=await accountApi('me'); state.data=data; renderAccount(data); return data;
  }
  function renderAccount(data){
    const a=data.account,m=data.member,u=data.user;
    $('#authView').hidden=true; $('#accountView').hidden=false;
    $('#accountDisplay').textContent=a.display_name; $('#accountUsername').textContent='@'+a.username; $('#accountEmail').textContent=u.email||'';
    $('#verifiedBadge').hidden=!u.email_confirmed_at; $('#roleBadge').textContent=(m?.role||'member').toUpperCase(); $('#communityRole').textContent=(m?.role||'member').toUpperCase();
    $('#createdDate').textContent=new Date(a.created_at).toLocaleDateString([], {year:'numeric',month:'short',day:'numeric'}); $('#emailState').textContent=u.email_confirmed_at?'Verified':'Unverified';
    $('#profileDisplayName').value=a.display_name||''; $('#profileBio').value=a.bio||''; $('#profileAvatarUrl').value=a.avatar_url||''; $('#bioCount').textContent=String((a.bio||'').length);
    $('#newUsername').value=a.username||''; $('#deleteUsernameHint').textContent=a.username; $('#deleteConfirmation').value='';
    const pref=a.preferences||{}; $('#prefCommunity').checked=pref.community_notifications!==false; $('#prefEmail').checked=pref.email_notifications!==false; $('#prefTheme').value=pref.theme==='system'?'system':'dark';
    const av=$('#accountAvatar'); av.textContent=initials(a.display_name); if(a.avatar_url){av.style.backgroundImage=`url(${JSON.stringify(a.avatar_url).slice(1,-1)})`;}else{const p=avatarStyle(a.avatar_seed);av.style.backgroundImage='none';av.style.background=`linear-gradient(145deg,${p[0]},${p[1]})`;}
  }

  async function applySession(session){
    state.session=session||null;
    if(!session){ $('#accountView').hidden=true; $('#authView').hidden=false; return; }
    try{ await loadAccount(); const next=nextTarget(); if(next && new URLSearchParams(location.search).get('complete')==='1') location.replace(next); }
    catch(e){ message(e.message,'error'); $('#accountView').hidden=true; $('#authView').hidden=false; }
  }

  async function signUpWithRedirect(payload){
    const redirect=accountUrl('?verified=1');
    let result=await sb.auth.signUp({...payload,options:{...(payload.options||{}),emailRedirectTo:redirect}});
    if(result.error && /redirect|not allowed|url/i.test(result.error.message||'')) result=await sb.auth.signUp(payload);
    return result;
  }

  function bindAuth(){
    $$('[data-auth-tab]').forEach(b=>b.addEventListener('click',()=>setAuthMode(b.dataset.authTab)));
    $$('[data-toggle-password]').forEach(b=>b.addEventListener('click',()=>{const i=$('#'+b.dataset.togglePassword);i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'Show':'Hide';}));
    $('[data-back-login]')?.addEventListener('click',()=>setAuthMode('login'));
    $('#forgotPassword')?.addEventListener('click',()=>setAuthMode('reset-request'));
    $('#registerPassword')?.addEventListener('input',renderStrength);
    $('#registerUsername')?.addEventListener('input',()=>{clearTimeout(state.usernameTimer);state.usernameTimer=setTimeout(()=>checkUsername($('#registerUsername'),$('#usernameStatus')),350)});
    $('#newUsername')?.addEventListener('input',()=>{clearTimeout(state.usernameTimer);state.usernameTimer=setTimeout(()=>checkUsername($('#newUsername'),$('#newUsernameStatus')),350)});

    $('#loginForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);message('');try{const {data,error}=await sb.auth.signInWithPassword({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});if(error)throw error;state.session=data.session||null;await applySession(data.session);const next=nextTarget();if(next)location.replace(next);}catch(err){message(err.message||'Sign in failed.','error')}finally{setBusy(f,false)}});

    $('#registerForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);message('');try{
      const username=cleanUsername($('#registerUsername').value),display=$('#registerDisplayName').value.trim(),email=$('#registerEmail').value.trim(),password=$('#registerPassword').value,confirm=$('#registerConfirm').value;
      if(password!==confirm)throw new Error('Password confirmation does not match.'); if(passwordScore(password)<2)throw new Error('Use a stronger password.'); if(!$('#termsAccept').checked)throw new Error('You must accept the terms.');
      const available=await checkUsername($('#registerUsername'),$('#usernameStatus')); if(!available)throw new Error('Choose an available username.');
      const {data,error}=await signUpWithRedirect({email,password,options:{data:{dlavie_signup:'true',username,display_name:display,terms_version:'v1'}}}); if(error)throw error;
      if(data.session){ state.session=data.session; await applySession(data.session); const next=nextTarget(); if(next)location.replace(next); }
      else{ message('Account created. Check your email to verify the address, then sign in.','success'); setAuthMode('login'); $('#loginEmail').value=email; }
    }catch(err){message(err.message||'Registration failed.','error')}finally{setBusy(f,false)}});

    $('#resetRequestForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);message('');try{const email=$('#resetEmail').value.trim();const redirect=accountUrl('?mode=reset');let {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:redirect});if(error&&/redirect|not allowed|url/i.test(error.message||'')){({error}=await sb.auth.resetPasswordForEmail(email));}if(error)throw error;message('Recovery email sent. Check your inbox.','success');}catch(err){message(err.message||'Could not send recovery email.','error')}finally{setBusy(f,false)}});

    $('#resetPasswordForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);message('');try{const p=$('#recoveryPassword').value,c=$('#recoveryConfirm').value;if(p!==c)throw new Error('Password confirmation does not match.');if(passwordScore(p)<2)throw new Error('Use a stronger password.');const {error}=await sb.auth.updateUser({password:p});if(error)throw error;message('Password updated.','success');state.recovery=false;setTimeout(()=>location.replace('account.html'),700);}catch(err){message(err.message||'Could not update password.','error')}finally{setBusy(f,false)}});
  }

  function setPanel(name){ $$('[data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel===name)); $$('[data-account-panel]').forEach(p=>p.classList.toggle('active',p.dataset.accountPanel===name)); }
  function bindDashboard(){
    $$('[data-panel]').forEach(b=>b.addEventListener('click',()=>setPanel(b.dataset.panel)));
    $('#profileBio')?.addEventListener('input',()=>$('#bioCount').textContent=String($('#profileBio').value.length));
    $('#profileForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);try{await accountApi('update_profile',{display_name:$('#profileDisplayName').value.trim(),bio:$('#profileBio').value,avatar_url:$('#profileAvatarUrl').value.trim(),preferences:state.data?.account?.preferences||{}});await loadAccount();$('#profileSaveState').textContent='Saved';toast('Profile saved.')}catch(err){toast(err.message)}finally{setBusy(f,false)}});
    $('#usernameForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);try{const username=cleanUsername($('#newUsername').value);if(username!==state.data.account.username){const available=await checkUsername($('#newUsername'),$('#newUsernameStatus'));if(!available)throw new Error('Username is not available.');}await accountApi('change_username',{username});await loadAccount();toast('Username updated.')}catch(err){toast(err.message)}finally{setBusy(f,false)}});
    $('#emailForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);try{const email=$('#newEmail').value.trim();if(!email)throw new Error('Enter a new email address.');const {error}=await sb.auth.updateUser({email});if(error)throw error;toast('Check your email to confirm the change.');}catch(err){toast(err.message)}finally{setBusy(f,false)}});
    $('#resendVerification')?.addEventListener('click',async()=>{try{const email=state.data?.user?.email;if(!email)throw new Error('Email unavailable.');let {error}=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:accountUrl('?verified=1')}});if(error&&/redirect|not allowed|url/i.test(error.message||''))({error}=await sb.auth.resend({type:'signup',email}));if(error)throw error;toast('Verification email sent.');}catch(err){toast(err.message)}});
    $('#passwordForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);try{const oldp=$('#currentPassword').value,newp=$('#newPassword').value,c=$('#newPasswordConfirm').value;if(newp!==c)throw new Error('Password confirmation does not match.');if(passwordScore(newp)<2)throw new Error('Use a stronger new password.');const email=state.data?.user?.email;const {error:reauth}=await sb.auth.signInWithPassword({email,password:oldp});if(reauth)throw new Error('Current password is incorrect.');const {error}=await sb.auth.updateUser({password:newp});if(error)throw error;f.reset();toast('Password updated.');}catch(err){toast(err.message)}finally{setBusy(f,false)}});
    $('#preferencesForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;setBusy(f,true);try{await accountApi('update_profile',{preferences:{community_notifications:$('#prefCommunity').checked,email_notifications:$('#prefEmail').checked,theme:$('#prefTheme').value}});await loadAccount();toast('Preferences saved.')}catch(err){toast(err.message)}finally{setBusy(f,false)}});
    $('#signOutButton')?.addEventListener('click',async()=>{await sb.auth.signOut({scope:'local'});state.session=null;location.replace('account.html')});
    $('#signOutAll')?.addEventListener('click',async()=>{try{const {error}=await sb.auth.signOut({scope:'global'});if(error)throw error;state.session=null;location.replace('account.html');}catch(err){toast(err.message)}});
    $('#exportData')?.addEventListener('click',async()=>{try{const data=await accountApi('export_account');const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`dlavie-account-${state.data.account.username}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Export created.')}catch(err){toast(err.message)}});
    $('#deleteAccount')?.addEventListener('click',async()=>{const confirm=$('#deleteConfirmation').value.trim();if(confirm.toLowerCase()!==String(state.data?.account?.username||'').toLowerCase()){toast('Type your exact username to confirm.');return;}if(!window.confirm('Permanently delete this DLavie account? This cannot be undone.'))return;try{await accountApi('delete_account',{confirm});await sb.auth.signOut({scope:'local'}).catch(()=>{});state.session=null;localStorage.removeItem('dlavie.community.session.v1');location.replace('./#home');}catch(err){toast(err.message)}});
  }

  function handleAuthEvent(event,session){
    state.session=session||null;
    setTimeout(async()=>{
      if(event==='PASSWORD_RECOVERY'){
        state.recovery=true;
        setAuthMode('reset-password');
        $('#authView').hidden=false;
        $('#accountView').hidden=true;
        return;
      }
      if(event==='SIGNED_OUT'){
        state.data=null;
        $('#accountView').hidden=true;
        $('#authView').hidden=false;
        if(!state.recovery)setAuthMode('login');
        return;
      }
      if(session&&!state.recovery) await applySession(session);
    },0);
  }

  async function init(){
    bindAuth();bindDashboard();
    const params=new URLSearchParams(location.search);
    if(params.get('mode')==='register')setAuthMode('register');
    if(params.get('mode')==='reset'){state.recovery=true;setAuthMode('reset-password')}

    const {data:{session}}=await sb.auth.getSession();
    state.session=session||null;
    if(session&&!state.recovery)await applySession(session);
    else if(!state.recovery){$('#authView').hidden=false;$('#accountView').hidden=true;}

    sb.auth.onAuthStateChange(handleAuthEvent);
    if(params.get('verified')==='1'&&!session)message('Email confirmation received. You can sign in now.','success');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
