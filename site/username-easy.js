(() => {
  'use strict';

  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const ACCOUNT_API=`${SUPABASE_URL}/functions/v1/dlavie-account`;
  if(!window.supabase) return;

  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const $=(s,r=document)=>r.querySelector(s);
  const state={registerSuggestions:[],profileSuggestions:[],registerTimer:null,profileTimer:null};

  function injectStyles(){
    if($('#usernameEasyStyles')) return;
    const style=document.createElement('style');
    style.id='usernameEasyStyles';
    style.textContent=`
      .username-easy-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:6px}
      .username-easy-row small{margin:0!important}.username-optional{font-size:10px;font-weight:800;letter-spacing:.08em;color:#7f8792;text-transform:uppercase}
      .username-suggestions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
      .username-suggestions[hidden]{display:none}
      .username-suggestion{appearance:none;border:1px solid rgba(255,255,255,.11);background:#26282d;color:#e7e9ed;padding:7px 10px;border-radius:999px;font-size:11px;font-weight:750;cursor:pointer;transition:background .16s,border-color .16s,transform .16s}
      .username-suggestion:hover{background:#30333a;border-color:rgba(255,255,255,.2);transform:translateY(-1px)}
      .username-suggestion:before{content:'@';color:#8b929d}
      .username-easy-help{display:flex;gap:8px;align-items:flex-start;margin-top:8px;color:#858c96;font-size:11px;line-height:1.45}
      .username-easy-help:before{content:'i';flex:0 0 auto;width:15px;height:15px;border:1px solid rgba(255,255,255,.14);border-radius:50%;display:grid;place-items:center;font:700 9px/1 Georgia;color:#bac0c9;margin-top:1px}
      .username-field.username-available{border-color:rgba(87,223,155,.5)!important;box-shadow:0 0 0 3px rgba(87,223,155,.06)}
      .username-field.username-taken{border-color:rgba(255,146,167,.42)!important}
      @media(max-width:640px){.username-easy-row{align-items:flex-start;flex-direction:column;gap:3px}.username-suggestion{padding:8px 11px}}
    `;
    document.head.appendChild(style);
  }

  function normalize(value){
    return String(value||'').toLowerCase().trim()
      .replace(/[\s-]+/g,'.')
      .replace(/[^a-z0-9._]+/g,'')
      .replace(/\.{2,}/g,'.')
      .replace(/^\.+|\.+$/g,'')
      .slice(0,30);
  }

  function configureInput(input,kind){
    if(!input) return;
    input.required=false;
    input.removeAttribute('required');
    input.minLength=2;
    input.maxLength=30;
    input.pattern='[a-z0-9._]+';
    input.autocapitalize='none';
    input.spellcheck=false;
    input.placeholder=kind==='register'?'your.name (optional)':'your.name';
    const field=input.closest('.username-field');
    if(field) field.dataset.easyUsername='true';
  }

  function setupCopy(){
    const register=$('#registerUsername');
    const regStatus=$('#usernameStatus');
    configureInput(register,'register');
    if(regStatus && !$('#registerUsernameSuggestions')){
      const row=document.createElement('div');
      row.className='username-easy-row';
      regStatus.parentNode.insertBefore(row,regStatus);
      row.appendChild(regStatus);
      const optional=document.createElement('span');
      optional.className='username-optional';
      optional.textContent='Optional';
      row.appendChild(optional);
      regStatus.textContent='Use letters, numbers, dots, or underscores. Leave blank and we’ll pick one for you.';
      const chips=document.createElement('div');
      chips.id='registerUsernameSuggestions'; chips.className='username-suggestions'; chips.hidden=true;
      row.insertAdjacentElement('afterend',chips);
      const help=document.createElement('div');
      help.className='username-easy-help';
      help.textContent='No need to hunt for a perfect handle. If yours is taken, DLavie will offer available alternatives automatically.';
      chips.insertAdjacentElement('afterend',help);
    }

    const profile=$('#newUsername');
    const profileStatus=$('#newUsernameStatus');
    configureInput(profile,'profile');
    const copy=profile?.closest('form')?.querySelector('.setting-copy p');
    if(copy) copy.textContent='Your unique DLavie handle. Changes are allowed again after 24 hours.';
    if(profileStatus && !$('#profileUsernameSuggestions')){
      profileStatus.textContent='Letters, numbers, dots, and underscores. 2–30 characters.';
      const chips=document.createElement('div');
      chips.id='profileUsernameSuggestions'; chips.className='username-suggestions'; chips.hidden=true;
      profileStatus.insertAdjacentElement('afterend',chips);
    }

    const registerHead=$('#registerForm .form-head p');
    if(registerHead) registerHead.textContent='Create your account first. Your username can be chosen now or generated automatically.';
  }

  async function available(username){
    const u=normalize(username);
    if(u.length<2) return false;
    const {data,error}=await sb.rpc('dlavie_username_available',{candidate:u});
    if(error) throw error;
    return !!data;
  }

  async function suggestions(seed){
    const base=normalize(seed)||'member';
    const {data,error}=await sb.rpc('dlavie_username_suggestions',{candidate:base});
    if(error) return [];
    return Array.isArray(data)?data.filter(Boolean).slice(0,6):[];
  }

  function paint(input,status,isAvailable,text){
    const field=input?.closest('.username-field');
    field?.classList.toggle('username-available',isAvailable===true);
    field?.classList.toggle('username-taken',isAvailable===false);
    if(status){
      status.textContent=text;
      status.style.color=isAvailable===true?'#79e6ad':isAvailable===false?'#ff92a7':'';
    }
  }

  function renderSuggestions(container,list,input){
    if(!container) return;
    container.innerHTML='';
    container.hidden=!list.length;
    list.forEach(username=>{
      const button=document.createElement('button');
      button.type='button'; button.className='username-suggestion'; button.textContent=username;
      button.addEventListener('click',()=>{
        input.value=username;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.focus();
      });
      container.appendChild(button);
    });
  }

  async function evaluate(input,status,container,seedFallback){
    const raw=input.value;
    const u=normalize(raw);
    if(raw!==u) input.value=u;
    if(!u){
      paint(input,status,null,'Optional — leave blank and we’ll choose an available username.');
      const list=await suggestions(seedFallback());
      renderSuggestions(container,list,input);
      return {username:'',available:false,list};
    }
    if(u.length<2){
      paint(input,status,false,'Use at least 2 characters.');
      renderSuggestions(container,[],input);
      return {username:u,available:false,list:[]};
    }
    paint(input,status,null,'Checking…');
    try{
      const free=await available(u);
      if(free){
        paint(input,status,true,`@${u} is available`);
        renderSuggestions(container,[],input);
        return {username:u,available:true,list:[]};
      }
      const list=await suggestions(u);
      paint(input,status,false,`@${u} is taken — try one of these:`);
      renderSuggestions(container,list,input);
      return {username:u,available:false,list};
    }catch{
      paint(input,status,null,'We’ll verify this username when you continue.');
      return {username:u,available:false,list:[]};
    }
  }

  function seedFromRegister(){
    const display=$('#registerDisplayName')?.value.trim();
    const email=$('#registerEmail')?.value.trim().split('@')[0];
    return display||email||'member';
  }

  function message(text,type=''){
    const el=$('#authMessage');
    if(!el) return;
    el.hidden=!text; el.textContent=text||''; el.className=`auth-message${type?' '+type:''}`;
  }
  function setBusy(form,busy,label='Creating account…'){
    const button=form?.querySelector('button[type="submit"]');
    if(!button) return;
    button.dataset.easyOld ||= button.textContent;
    button.disabled=busy;
    button.textContent=busy?label:button.dataset.easyOld;
  }

  async function signUp(email,password,username,display){
    const redirect=`${location.origin}${location.pathname}?verified=1`;
    let result=await sb.auth.signUp({email,password,options:{data:{dlavie_signup:'true',username:username||'',display_name:display,terms_version:'v1'},emailRedirectTo:redirect}});
    if(result.error && /redirect|not allowed|url/i.test(result.error.message||'')){
      result=await sb.auth.signUp({email,password,options:{data:{dlavie_signup:'true',username:username||'',display_name:display,terms_version:'v1'}}});
    }
    return result;
  }

  async function handleRegister(event){
    const form=event.target;
    if(!(form instanceof HTMLFormElement) || form.id!=='registerForm') return;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation?.();
    setBusy(form,true); message('');
    try{
      const display=$('#registerDisplayName').value.trim();
      const email=$('#registerEmail').value.trim();
      const password=$('#registerPassword').value;
      const confirm=$('#registerConfirm').value;
      if(password!==confirm) throw new Error('Password confirmation does not match.');
      if(password.length<10) throw new Error('Use at least 10 characters for your password.');
      if(!$('#termsAccept').checked) throw new Error('You must accept the terms.');

      let chosen=normalize($('#registerUsername').value);
      if(chosen){
        const free=await available(chosen).catch(()=>false);
        if(!free){
          const list=await suggestions(chosen||display||email.split('@')[0]);
          chosen=list[0]||'';
          if(chosen) $('#registerUsername').value=chosen;
        }
      }
      if(!chosen){
        const list=await suggestions(display||email.split('@')[0]);
        chosen=list[0]||'';
        if(chosen) $('#registerUsername').value=chosen;
      }

      const {data,error}=await signUp(email,password,chosen,display);
      if(error) throw error;
      if(data.session){
        const next=new URLSearchParams(location.search).get('next');
        location.replace(next==='community'?'community.html':'account.html');
      }else{
        message(`Account created${chosen?` as @${chosen}`:''}. Check your email to verify it, then sign in.`,'success');
        $('#loginEmail').value=email;
        document.querySelector('[data-auth-tab="login"]')?.click();
      }
    }catch(error){
      message(error?.message||'Registration failed.','error');
    }finally{ setBusy(form,false); }
  }

  async function accountApi(action,payload={}){
    const {data:{session}}=await sb.auth.getSession();
    if(!session) throw new Error('Please sign in first.');
    const res=await fetch(ACCOUNT_API,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({action,...payload})});
    const json=await res.json().catch(()=>({}));
    if(!res.ok||!json.ok){const e=new Error(json?.error?.message||`Request failed (${res.status})`);e.code=json?.error?.code;throw e;}
    return json.data;
  }

  async function handleProfileUsername(event){
    const form=event.target;
    if(!(form instanceof HTMLFormElement)||form.id!=='usernameForm') return;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation?.();
    const button=form.querySelector('button[type="submit"]');
    const old=button?.textContent;
    if(button){button.disabled=true;button.textContent='Checking…';}
    try{
      const input=$('#newUsername');
      const status=$('#newUsernameStatus');
      const container=$('#profileUsernameSuggestions');
      const username=normalize(input.value);
      const current=($('#accountUsername')?.textContent||'').replace(/^@/,'').toLowerCase();
      if(username===current){ if(status) status.textContent='That is already your username.'; return; }
      if(username.length<2) throw new Error('Use at least 2 characters.');
      const free=await available(username);
      if(!free){
        const list=await suggestions(username);
        paint(input,status,false,`@${username} is taken — choose an available suggestion:`);
        renderSuggestions(container,list,input);
        return;
      }
      const account=await accountApi('change_username',{username});
      $('#accountUsername').textContent='@'+account.username;
      $('#deleteUsernameHint').textContent=account.username;
      paint(input,status,true,`Saved as @${account.username}`);
      renderSuggestions(container,[],input);
      const toast=$('#accountToast'); if(toast){toast.textContent='Username updated.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200);}
    }catch(error){
      const status=$('#newUsernameStatus'); if(status){status.textContent=error?.message||'Could not update username.';status.style.color='#ff92a7';}
    }finally{if(button){button.disabled=false;button.textContent=old||'Change username';}}
  }

  function bindInputs(){
    const register=$('#registerUsername');
    register?.addEventListener('input',event=>{
      event.stopImmediatePropagation();
      clearTimeout(state.registerTimer);
      state.registerTimer=setTimeout(()=>evaluate(register,$('#usernameStatus'),$('#registerUsernameSuggestions'),seedFromRegister),260);
    },true);
    ['registerDisplayName','registerEmail'].forEach(id=>$('#'+id)?.addEventListener('input',()=>{
      if(register && !register.value.trim()){
        clearTimeout(state.registerTimer);
        state.registerTimer=setTimeout(()=>evaluate(register,$('#usernameStatus'),$('#registerUsernameSuggestions'),seedFromRegister),320);
      }
    }));

    const profile=$('#newUsername');
    profile?.addEventListener('input',event=>{
      event.stopImmediatePropagation();
      clearTimeout(state.profileTimer);
      state.profileTimer=setTimeout(()=>evaluate(profile,$('#newUsernameStatus'),$('#profileUsernameSuggestions'),()=>profile.value),260);
    },true);

    document.addEventListener('submit',handleRegister,true);
    document.addEventListener('submit',handleProfileUsername,true);
  }

  function init(){
    injectStyles(); setupCopy(); bindInputs();
    setTimeout(()=>{
      const register=$('#registerUsername');
      if(register && !register.value) evaluate(register,$('#usernameStatus'),$('#registerUsernameSuggestions'),seedFromRegister);
    },400);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
