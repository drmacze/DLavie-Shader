(() => {
  'use strict';

  const SUPABASE_URL = 'https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const API_URL = `${SUPABASE_URL}/functions/v1/dlavie-community`;
  const TOKEN_KEY = 'dlavie.community.session.v1';
  const EMOJIS = ['👍','❤️','😂','🔥','🎉','👀'];
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 12 } }
  });

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const state = {
    token: localStorage.getItem(TOKEN_KEY) || '',
    me: null,
    blocked: new Set(),
    muted: false,
    channel: null,
    messages: new Map(),
    members: new Map(),
    reactions: [],
    pins: new Set(),
    replyTo: null,
    editing: null,
    reportTarget: null,
    profileTarget: null,
    reactionTarget: null,
    realtime: [],
    presence: null,
    typing: new Map(),
    heartbeat: null,
    search: ''
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const textHtml = value => esc(value).replace(/\n/g, '<br>');
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function toast(message){
    const el = $('#communityToast');
    if(!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  async function api(action, payload={}){
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    };
    if(state.token) headers['x-dlavie-session'] = state.token;
    const res = await fetch(API_URL, { method:'POST', headers, body:JSON.stringify({action,...payload}) });
    const json = await res.json().catch(() => ({}));
    if(!res.ok || !json.ok){
      const error = new Error(json?.error?.message || `Request failed (${res.status})`);
      error.code = json?.error?.code || 'REQUEST_FAILED';
      error.status = res.status;
      throw error;
    }
    return json.data;
  }

  function avatarStyle(seed='dlavie'){
    let hash = 0;
    for(const ch of seed) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
    const palettes = [
      ['#3ab7f4','#3157d8'],['#ff4f8f','#8e3ce8'],['#f4c94c','#ed7e39'],
      ['#23d778','#168e62'],['#a7b0ff','#5a61d5'],['#ff8b68','#c94d5b']
    ];
    const pair = palettes[Math.abs(hash) % palettes.length];
    return `background:linear-gradient(145deg,${pair[0]},${pair[1]})`;
  }

  function initials(name='?'){
    return name.trim().split(/\s+/).slice(0,2).map(x => x[0] || '').join('').toUpperCase() || '?';
  }

  function formatTime(iso){
    const d = new Date(iso);
    const today = new Date();
    if(d.toDateString() === today.toDateString()) return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    return d.toLocaleDateString([], {day:'2-digit',month:'short'}) + ' ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  function openModal(id){ const el=$(id); if(el){el.hidden=false; document.body.style.overflow='hidden';} }
  function closeModal(id){ const el=$(id); if(el){el.hidden=true; document.body.style.overflow='';} }

  function updateIdentityUI(){
    const logged = !!state.me;
    $('#composerJoin').hidden = logged;
    $('#messageForm').hidden = !logged;
    $('#topProfileName').textContent = logged ? state.me.display_name : 'Join';
    const av = $('#topAvatar');
    av.textContent = logged ? initials(state.me.display_name) : '?';
    av.style.cssText = logged ? avatarStyle(state.me.avatar_seed) : 'background:#2b2e34';
    $('#staffCard').hidden = !logged || !['moderator','admin'].includes(state.me.role);
    if(logged && state.muted){
      $('#messageInput').placeholder = 'You are muted';
      $('#messageInput').disabled = true;
      $('#sendButton').disabled = true;
    }else if(logged){
      $('#messageInput').placeholder = 'Message #global';
      $('#messageInput').disabled = false;
      $('#sendButton').disabled = false;
    }
  }

  async function restoreIdentity(){
    if(!state.token){ updateIdentityUI(); return; }
    try{
      const data = await api('me');
      state.me = data.member;
      state.blocked = new Set(data.blocked || []);
      state.muted = !!data.muted;
      state.members.set(state.me.id, state.me);
    }catch(err){
      localStorage.removeItem(TOKEN_KEY);
      state.token=''; state.me=null; state.blocked.clear(); state.muted=false;
    }
    updateIdentityUI();
  }

  async function createIdentity(name){
    const data = await api('create_session',{display_name:name});
    state.token = data.token;
    localStorage.setItem(TOKEN_KEY, state.token);
    state.me = data.member;
    state.blocked = new Set(data.blocked || []);
    state.muted = false;
    state.members.set(state.me.id, state.me);
    updateIdentityUI();
    await startPresence(true);
    startHeartbeat();
    return data.member;
  }

  async function loadChannel(){
    const {data,error} = await sb.from('dlavie_community_channels').select('id,slug,name,description,is_readonly').eq('slug','global').single();
    if(error) throw error;
    state.channel = data;
    return data;
  }

  async function loadMessages({preserveScroll=false}={}){
    if(!state.channel) await loadChannel();
    const scroller = $('#messageScroller');
    const beforeBottom = scroller ? scroller.scrollHeight - scroller.scrollTop : 0;
    const {data,error} = await sb.from('dlavie_community_messages')
      .select('id,channel_id,member_id,body,reply_to,created_at,edited_at,status')
      .eq('channel_id', state.channel.id)
      .order('created_at',{ascending:false}).limit(120);
    if(error) throw error;
    state.messages.clear();
    (data || []).reverse().forEach(m => state.messages.set(Number(m.id),m));
    await hydrateMembers();
    await Promise.all([loadReactions(),loadPins()]);
    renderMessages(); renderPins();
    $('#chatLoading').hidden=true;
    if(scroller){
      if(preserveScroll) scroller.scrollTop = Math.max(0, scroller.scrollHeight - beforeBottom);
      else scroller.scrollTop = scroller.scrollHeight;
    }
  }

  async function hydrateMembers(extraIds=[]){
    const ids = new Set(extraIds.filter(Boolean));
    for(const m of state.messages.values()) ids.add(m.member_id);
    const missing = [...ids].filter(id => !state.members.has(id));
    if(!missing.length) return;
    const {data,error} = await sb.from('dlavie_community_members')
      .select('id,display_name,role,avatar_seed,bio,is_banned,created_at,last_seen').in('id',missing);
    if(error) return;
    (data || []).forEach(m => state.members.set(m.id,m));
  }

  async function loadReactions(){
    const ids=[...state.messages.keys()];
    state.reactions=[];
    if(!ids.length) return;
    const {data} = await sb.from('dlavie_community_reactions').select('message_id,member_id,emoji').in('message_id',ids);
    state.reactions = data || [];
  }

  async function refreshReactions(messageId){
    state.reactions = state.reactions.filter(r => Number(r.message_id)!==Number(messageId));
    const {data} = await sb.from('dlavie_community_reactions').select('message_id,member_id,emoji').eq('message_id',messageId);
    state.reactions.push(...(data || []));
    renderMessages();
  }

  async function loadPins(){
    state.pins.clear();
    const ids=[...state.messages.keys()]; if(!ids.length) return;
    const {data} = await sb.from('dlavie_community_pins').select('message_id').in('message_id',ids);
    (data || []).forEach(p => state.pins.add(Number(p.message_id)));
  }

  function reactionSummary(messageId){
    const map = new Map();
    state.reactions.filter(r => Number(r.message_id)===Number(messageId)).forEach(r => {
      if(!map.has(r.emoji)) map.set(r.emoji,{count:0,mine:false});
      const item=map.get(r.emoji); item.count++; if(state.me && r.member_id===state.me.id) item.mine=true;
    });
    return map;
  }

  function messageMatchesSearch(msg,member){
    if(!state.search) return true;
    const hay=(msg.body+' '+(member?.display_name||'')).toLowerCase();
    return hay.includes(state.search);
  }

  function renderMessages(){
    const list=$('#messageList'); if(!list) return;
    const items=[...state.messages.values()].filter(m => !state.blocked.has(m.member_id));
    let previous=null;
    list.innerHTML=items.map(msg => {
      const member=state.members.get(msg.member_id) || {display_name:'Unknown',role:'member',avatar_seed:msg.member_id};
      const compact = previous && previous.member_id===msg.member_id && !msg.reply_to && (new Date(msg.created_at)-new Date(previous.created_at)<5*60_000);
      previous=msg;
      const reply = msg.reply_to ? state.messages.get(Number(msg.reply_to)) : null;
      const replyMember = reply ? state.members.get(reply.member_id) : null;
      const reactions=[...reactionSummary(msg.id).entries()].map(([emoji,v])=>`<button class="reaction-chip${v.mine?' mine':''}" data-react="${msg.id}" data-emoji="${emoji}" type="button">${emoji}<span>${v.count}</span></button>`).join('');
      const role = member.role !== 'member' ? `<span class="message-role staff">${esc(member.role.toUpperCase())}</span>` : '';
      const searchClass = messageMatchesSearch(msg,member) ? '' : ' hidden-by-search';
      return `<article class="message${compact?' compact':''}${searchClass}" data-message-id="${msg.id}">
        <button class="message-avatar" data-profile="${esc(member.id)}" style="${avatarStyle(member.avatar_seed)}" type="button">${esc(initials(member.display_name))}</button>
        <div class="message-main">
          ${compact?'':`<div class="message-head"><button class="message-name" data-profile="${esc(member.id)}" type="button">${esc(member.display_name)}</button>${role}<span class="message-time">${esc(formatTime(msg.created_at))}</span>${msg.edited_at?'<span class="message-edited">edited</span>':''}</div>`}
          ${reply?`<button class="message-reply" data-jump="${reply.id}" type="button"><strong>${esc(replyMember?.display_name||'Member')}</strong><span>${esc(reply.body)}</span></button>`:''}
          <div class="message-body">${textHtml(msg.body)}</div>
          ${reactions?`<div class="reaction-row">${reactions}</div>`:''}
        </div>
        <div class="message-actions">
          <button class="message-action reply-action" data-reply="${msg.id}" type="button" aria-label="Reply"><svg viewBox="0 0 24 24"><path d="m9 17-6-5 6-5v3h5a6 6 0 0 1 6 6v2"/></svg></button>
          <button class="message-action react-action" data-react-open="${msg.id}" type="button" aria-label="React">☺</button>
          <button class="message-action" data-more="${msg.id}" type="button" aria-label="More"><svg viewBox="0 0 24 24"><path d="M12 5.5v.01M12 12v.01M12 18.5v.01"/></svg></button>
        </div>
      </article>`;
    }).join('');
  }

  function renderPins(){
    const pins=[...state.pins].map(id=>state.messages.get(id)).filter(Boolean);
    $('#pinCountBadge').textContent=String(pins.length);
    const list=$('#pinnedList');
    if(!pins.length){
      list.innerHTML='<p class="muted-small">Nothing pinned yet.</p>';
      $('#pinnedBanner').hidden=true;
      return;
    }
    list.innerHTML=pins.slice().reverse().map(m=>{const member=state.members.get(m.member_id);return `<button class="pinned-item" data-jump="${m.id}" type="button"><strong>${esc(member?.display_name||'Member')}</strong><span>${esc(m.body)}</span></button>`}).join('');
    const latest=pins[pins.length-1];
    $('#pinnedBannerText').textContent=`${state.members.get(latest.member_id)?.display_name||'Member'}: ${latest.body}`;
  }

  async function refreshOnlineFallback(){
    const {data} = await sb.rpc('dlavie_community_online_count');
    const n=Number(data||0); $('#onlineCount').textContent=n; $('#onlineSideCount').textContent=n;
  }

  function renderPresence(){
    if(!state.presence) return;
    const raw=state.presence.presenceState();
    const seen=new Map();
    Object.values(raw).flat().forEach(p => { if(p.member_id && !seen.has(p.member_id)) seen.set(p.member_id,p); });
    const members=[...seen.values()];
    $('#onlineCount').textContent=String(members.length);
    $('#onlineSideCount').textContent=String(members.length);
    const container=$('#onlineMembers');
    container.innerHTML=members.length?members.map(p=>`<button class="online-member" data-profile="${esc(p.member_id)}" type="button"><span class="mini-avatar" style="${avatarStyle(p.avatar_seed||p.member_id)}">${esc(initials(p.display_name))}</span><span><strong>${esc(p.display_name)}</strong><span>${esc((p.role||'member').toUpperCase())}</span></span></button>`).join(''):'<p class="muted-small">No active members yet.</p>';
  }

  function renderTyping(){
    const now=Date.now();
    for(const [id,t] of state.typing) if(t.expires<now) state.typing.delete(id);
    const names=[...state.typing.values()].filter(t=>!state.me||t.member_id!==state.me.id).map(t=>t.display_name);
    $('#typingLine').textContent = names.length===0?'':names.length===1?`${names[0]} is typing…`:`${names.slice(0,2).join(', ')} are typing…`;
  }

  async function startPresence(force=false){
    if(state.presence && !force) return;
    if(state.presence){ await sb.removeChannel(state.presence); state.presence=null; }
    const key=state.me?.id || `viewer-${crypto.randomUUID()}`;
    state.presence=sb.channel('dlavie-global-presence',{config:{presence:{key},broadcast:{self:false}}});
    state.presence.on('presence',{event:'sync'},renderPresence)
      .on('broadcast',{event:'typing'},({payload})=>{
        if(!payload?.member_id) return;
        state.typing.set(payload.member_id,{...payload,expires:Date.now()+2600}); renderTyping();
      })
      .subscribe(async status=>{
        if(status==='SUBSCRIBED'){
          if(state.me) await state.presence.track({member_id:state.me.id,display_name:state.me.display_name,role:state.me.role,avatar_seed:state.me.avatar_seed,at:new Date().toISOString()});
          setConnection(true);
        }
        if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED') setConnection(false);
      });
  }

  function setConnection(connected){
    const el=$('#connectionState'); el.innerHTML=`<i></i> ${connected?'Live':'Reconnecting…'}`;
    el.parentElement.classList.toggle('connected',connected);
  }

  async function startRealtime(){
    state.realtime.forEach(ch=>sb.removeChannel(ch)); state.realtime=[];
    if(!state.channel) return;
    const msg=sb.channel('dlavie-messages')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'dlavie_community_messages',filter:`channel_id=eq.${state.channel.id}`},async payload=>{
        const m=payload.new; await hydrateMembers([m.member_id]); state.messages.set(Number(m.id),m); renderMessages();
        const sc=$('#messageScroller'); if(sc.scrollHeight-sc.scrollTop-sc.clientHeight<240) requestAnimationFrame(()=>sc.scrollTop=sc.scrollHeight);
      })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'dlavie_community_messages',filter:`channel_id=eq.${state.channel.id}`},async()=>{await loadMessages({preserveScroll:true})})
      .subscribe();
    const react=sb.channel('dlavie-reactions')
      .on('postgres_changes',{event:'*',schema:'public',table:'dlavie_community_reactions'},async payload=>{
        const id=Number(payload.new?.message_id||payload.old?.message_id||0); if(id&&state.messages.has(id)) await refreshReactions(id);
      }).subscribe();
    const pins=sb.channel('dlavie-pins')
      .on('postgres_changes',{event:'*',schema:'public',table:'dlavie_community_pins'},async()=>{await loadPins();renderPins()}).subscribe();
    state.realtime.push(msg,react,pins);
    await startPresence();
  }

  function startHeartbeat(){
    clearInterval(state.heartbeat);
    if(!state.me) return;
    const beat=()=>api('heartbeat').catch(()=>{});
    beat(); state.heartbeat=setInterval(beat,45000);
  }

  function setReply(id){
    const msg=state.messages.get(Number(id)); if(!msg) return;
    state.replyTo=msg.id; state.editing=null;
    $('#replyName').textContent=state.members.get(msg.member_id)?.display_name||'Member';
    $('#replyText').textContent=msg.body; $('#replyPreview').hidden=false; $('#editPreview').hidden=true;
    $('#messageInput').focus();
  }

  function clearReply(){ state.replyTo=null; $('#replyPreview').hidden=true; }
  function beginEdit(id){
    const msg=state.messages.get(Number(id)); if(!msg||!state.me||msg.member_id!==state.me.id) return;
    state.editing=msg.id; state.replyTo=null; $('#messageInput').value=msg.body; autoGrow(); updateCount();
    $('#editPreview').hidden=false; $('#replyPreview').hidden=true; $('#messageInput').focus();
  }
  function clearEdit(){ state.editing=null; $('#editPreview').hidden=true; $('#messageInput').value=''; autoGrow(); updateCount(); }

  async function submitMessage(){
    if(!state.me){ openModal('#joinModal'); return; }
    const input=$('#messageInput'), body=input.value.trim(); if(!body) return;
    const btn=$('#sendButton'); btn.disabled=true;
    try{
      if(state.editing){
        await api('edit_message',{message_id:state.editing,body}); clearEdit(); toast('Message updated.');
      }else{
        await api('send_message',{body,reply_to:state.replyTo,client_nonce:crypto.randomUUID()}); input.value=''; clearReply(); autoGrow(); updateCount();
      }
    }catch(err){
      if(err.code==='MUTED'){state.muted=true;updateIdentityUI();}
      toast(err.message);
    }finally{ if(!state.muted) btn.disabled=false; }
  }

  async function toggleReaction(messageId,emoji){
    if(!state.me){openModal('#joinModal');return;}
    try{await api('react',{message_id:Number(messageId),emoji}); await refreshReactions(Number(messageId));}
    catch(err){toast(err.message)}
  }

  function openReactionPicker(messageId,anchor){
    state.reactionTarget=Number(messageId);
    const picker=$('#emojiPicker'); picker.hidden=false;
    if(anchor){const r=anchor.getBoundingClientRect();picker.style.position='fixed';picker.style.left=Math.max(8,Math.min(innerWidth-picker.offsetWidth-8,r.left-80))+'px';picker.style.top=Math.max(8,r.top-50)+'px';picker.style.bottom='auto';}
  }

  function closeReactionPicker(){state.reactionTarget=null;$('#emojiPicker').hidden=true;$('#emojiPicker').style.cssText='';}

  function jumpToMessage(id){
    const el=$(`[data-message-id="${Number(id)}"]`); if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'center'}); el.animate([{background:'#30343b'},{background:'transparent'}],{duration:1100});
  }

  function ensureMenuModal(){
    let wrap=$('#messageMenuModal'); if(wrap)return wrap;
    wrap=document.createElement('div');wrap.id='messageMenuModal';wrap.className='modal-backdrop';wrap.hidden=true;
    wrap.innerHTML='<section class="community-modal"><button class="x-close" data-close-menu type="button">×</button><span class="sidebar-kicker">MESSAGE ACTIONS</span><h2 id="messageMenuTitle">Message</h2><div id="messageMenuActions" class="moderation-queue"></div></section>';
    document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap||e.target.closest('[data-close-menu]'))closeModal('#messageMenuModal')});return wrap;
  }

  function actionButton(label,action,danger=false){return `<button class="dark-button full${danger?' danger':''}" data-message-action="${action}" type="button">${label}</button>`}

  function openMessageMenu(id){
    const msg=state.messages.get(Number(id)); if(!msg)return;
    const member=state.members.get(msg.member_id); const own=state.me&&msg.member_id===state.me.id; const staff=state.me&&['moderator','admin'].includes(state.me.role);
    ensureMenuModal(); state.menuMessage=msg.id; $('#messageMenuTitle').textContent=member?`Message by ${member.display_name}`:'Message';
    let html=actionButton('Copy message','copy')+actionButton('Reply','reply');
    if(own){html+=actionButton('Edit message','edit')+actionButton('Delete message','delete',true)}
    else if(state.me){html+=actionButton(state.blocked.has(msg.member_id)?'Unblock member':'Block member','block')+actionButton('Report message','report',true)}
    if(staff){html+=actionButton(state.pins.has(msg.id)?'Unpin message':'Pin message','pin')+actionButton('Remove as moderator','mod-remove',true)+actionButton('Mute member 10 min','mute')+actionButton('Ban member','ban',true)}
    $('#messageMenuActions').innerHTML=html;openModal('#messageMenuModal');
  }

  async function handleMessageAction(action){
    const msg=state.messages.get(Number(state.menuMessage)); if(!msg)return; closeModal('#messageMenuModal');
    try{
      if(action==='copy'){await navigator.clipboard.writeText(msg.body);toast('Message copied.');}
      else if(action==='reply')setReply(msg.id);
      else if(action==='edit')beginEdit(msg.id);
      else if(action==='delete'){await api('delete_message',{message_id:msg.id});state.messages.delete(msg.id);renderMessages();toast('Message deleted.');}
      else if(action==='block'){const blocked=!state.blocked.has(msg.member_id);await api('block',{member_id:msg.member_id,blocked});blocked?state.blocked.add(msg.member_id):state.blocked.delete(msg.member_id);renderMessages();toast(blocked?'Member blocked.':'Member unblocked.');}
      else if(action==='report'){state.reportTarget=msg.id;openModal('#reportModal');}
      else if(action==='pin'){await api('pin',{message_id:msg.id,pinned:!state.pins.has(msg.id)});await loadPins();renderPins();toast(state.pins.has(msg.id)?'Message pinned.':'Message unpinned.');}
      else if(action==='mod-remove'){await api('delete_message',{message_id:msg.id,reason:'Removed from community UI'});state.messages.delete(msg.id);renderMessages();toast('Message removed.');}
      else if(action==='mute'){await api('moderate',{member_id:msg.member_id,moderation_action:'mute',duration_minutes:10,reason:'Moderator action from community UI'});toast('Member muted for 10 minutes.');}
      else if(action==='ban'){await api('moderate',{member_id:msg.member_id,moderation_action:'ban',reason:'Moderator action from community UI'});toast('Member banned.');}
    }catch(err){toast(err.message)}
  }

  async function openProfile(memberId){
    const member=state.members.get(memberId); if(!member)return;
    state.profileTarget=memberId; $('#profileTitle').textContent=member.display_name; $('#profileRole').textContent=member.role.toUpperCase();
    $('#profileSince').textContent=`Joined ${new Date(member.created_at).toLocaleDateString()}`;
    const av=$('#profileAvatar');av.textContent=initials(member.display_name);av.style.cssText=avatarStyle(member.avatar_seed);
    const own=state.me&&member.id===state.me.id; $('#profileForm').hidden=!own;$('#logoutButton').hidden=!own;$('#otherProfileActions').hidden=own;
    if(own){$('#profileName').value=member.display_name;$('#profileBio').value=member.bio||'';}
    else{$('#otherProfileBio').textContent=member.bio||'No bio yet.';$('#blockProfile').textContent=state.blocked.has(member.id)?'Unblock member':'Block member';}
    openModal('#profileModal');
  }

  async function submitReport(){
    if(!state.reportTarget)return;
    try{await api('report',{message_id:state.reportTarget,reason:$('#reportReason').value,details:$('#reportDetails').value});closeModal('#reportModal');$('#reportDetails').value='';state.reportTarget=null;toast('Report sent to moderators.');}
    catch(err){toast(err.message)}
  }

  async function loadModerationQueue(){
    const box=$('#moderationQueue');box.innerHTML='<p class="muted-small">Loading reports…</p>';
    try{
      const rows=await api('moderation_queue');
      box.innerHTML=rows.length?rows.map(r=>{const msg=r.dlavie_community_messages;const target=msg?state.members.get(msg.member_id):null;return `<article class="report-card" data-report-id="${r.id}" data-target-member="${esc(msg?.member_id||'')}" data-report-message="${msg?.id||''}"><div class="report-card-head"><strong>${esc(r.reason.toUpperCase())}</strong><time>${esc(formatTime(r.created_at))}</time></div><p>Reported by ${esc(r.dlavie_community_members?.display_name||'Member')}${target?` · message by ${esc(target.display_name)}`:''}</p><blockquote>${esc(msg?.body||'Message unavailable')}</blockquote>${r.details?`<p>${esc(r.details)}</p>`:''}<div class="report-card-actions"><button data-report-action="dismiss" type="button">Dismiss</button><button data-report-action="remove" class="danger" type="button">Remove message</button><button data-report-action="mute" type="button">Mute 10m</button><button data-report-action="ban" class="danger" type="button">Ban</button></div></article>`}).join(''):'<p class="muted-small">No open reports. Community queue is clear.</p>';
    }catch(err){box.innerHTML=`<p class="muted-small">${esc(err.message)}</p>`}
  }

  async function handleReportAction(card,action){
    const reportId=Number(card.dataset.reportId),target=card.dataset.targetMember,messageId=Number(card.dataset.reportMessage||0);
    try{
      if(action==='dismiss') await api('resolve_report',{report_id:reportId,status:'dismissed'});
      if(action==='remove'){await api('delete_message',{message_id:messageId,reason:'Reported content removed'});await api('resolve_report',{report_id:reportId,status:'actioned'});}
      if(action==='mute'){await api('moderate',{member_id:target,moderation_action:'mute',duration_minutes:10,reason:'Actioned community report'});await api('resolve_report',{report_id:reportId,status:'actioned'});}
      if(action==='ban'){await api('moderate',{member_id:target,moderation_action:'ban',reason:'Actioned community report'});await api('resolve_report',{report_id:reportId,status:'actioned'});}
      await loadModerationQueue();toast('Moderation action saved.');
    }catch(err){toast(err.message)}
  }

  function autoGrow(){const el=$('#messageInput');el.style.height='auto';el.style.height=Math.min(140,el.scrollHeight)+'px'}
  function updateCount(){const n=$('#messageInput').value.length;$('#composerCount').textContent=`${n}/1200`}

  function bindEvents(){
    $('#joinFromComposer').addEventListener('click',()=>openModal('#joinModal'));
    $('#profileButton').addEventListener('click',()=>state.me?openProfile(state.me.id):openModal('#joinModal'));
    $('#closeJoin').addEventListener('click',()=>closeModal('#joinModal'));
    $('#closeProfile').addEventListener('click',()=>closeModal('#profileModal'));
    $('#closeReport').addEventListener('click',()=>closeModal('#reportModal'));
    $('#closeRules').addEventListener('click',()=>closeModal('#rulesModal'));
    $('#closeModeration').addEventListener('click',()=>closeModal('#moderationModal'));
    $('#openRules').addEventListener('click',()=>openModal('#rulesModal'));
    $('#openModeration').addEventListener('click',async()=>{openModal('#moderationModal');await loadModerationQueue()});
    $('#joinForm').addEventListener('submit',async e=>{e.preventDefault();const btn=e.submitter;btn.disabled=true;try{await createIdentity($('#joinName').value);closeModal('#joinModal');await loadMessages({preserveScroll:true});toast(`Welcome, ${state.me.display_name}.`)}catch(err){toast(err.message)}finally{btn.disabled=false}});
    $('#messageForm').addEventListener('submit',async e=>{e.preventDefault();await submitMessage()});
    $('#messageInput').addEventListener('input',()=>{autoGrow();updateCount();if(state.me&&state.presence){clearTimeout(state.typingTimer);state.presence.send({type:'broadcast',event:'typing',payload:{member_id:state.me.id,display_name:state.me.display_name}}).catch(()=>{});state.typingTimer=setTimeout(()=>{},1200)}});
    $('#messageInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&innerWidth>760){e.preventDefault();submitMessage()}});
    $('#cancelReply').addEventListener('click',clearReply);$('#cancelEdit').addEventListener('click',clearEdit);
    $('#emojiButton').addEventListener('click',e=>{state.reactionTarget=null;const p=$('#emojiPicker');p.hidden=!p.hidden;p.style.cssText=''});
    $('#emojiPicker').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const emoji=b.textContent.trim();if(state.reactionTarget)await toggleReaction(state.reactionTarget,emoji);else{$('#messageInput').value+=emoji;autoGrow();updateCount();$('#messageInput').focus()}closeReactionPicker()});
    document.addEventListener('click',e=>{
      const reply=e.target.closest('[data-reply]');if(reply)return setReply(reply.dataset.reply);
      const react=e.target.closest('[data-react]');if(react)return toggleReaction(react.dataset.react,react.dataset.emoji);
      const reactOpen=e.target.closest('[data-react-open]');if(reactOpen)return openReactionPicker(reactOpen.dataset.reactOpen,reactOpen);
      const more=e.target.closest('[data-more]');if(more)return openMessageMenu(more.dataset.more);
      const profile=e.target.closest('[data-profile]');if(profile)return openProfile(profile.dataset.profile);
      const jump=e.target.closest('[data-jump]');if(jump)return jumpToMessage(jump.dataset.jump);
      const msgAction=e.target.closest('[data-message-action]');if(msgAction)return handleMessageAction(msgAction.dataset.messageAction);
      const reportAction=e.target.closest('[data-report-action]');if(reportAction)return handleReportAction(reportAction.closest('.report-card'),reportAction.dataset.reportAction);
      if(!e.target.closest('#emojiPicker')&&!e.target.closest('[data-react-open]')&&!e.target.closest('#emojiButton'))closeReactionPicker();
    });
    $('#reportForm').addEventListener('submit',e=>{e.preventDefault();submitReport()});
    $('#profileForm').addEventListener('submit',async e=>{e.preventDefault();try{const member=await api('update_profile',{display_name:$('#profileName').value,bio:$('#profileBio').value});state.me=member;state.members.set(member.id,member);updateIdentityUI();await startPresence(true);renderMessages();closeModal('#profileModal');toast('Profile updated.')}catch(err){toast(err.message)}});
    $('#blockProfile').addEventListener('click',async()=>{const id=state.profileTarget;if(!id)return;const blocked=!state.blocked.has(id);try{await api('block',{member_id:id,blocked});blocked?state.blocked.add(id):state.blocked.delete(id);renderMessages();$('#blockProfile').textContent=blocked?'Unblock member':'Block member';toast(blocked?'Member blocked.':'Member unblocked.')}catch(err){toast(err.message)}});
    $('#logoutButton').addEventListener('click',async()=>{try{await api('logout')}catch{}localStorage.removeItem(TOKEN_KEY);state.token='';state.me=null;state.blocked.clear();state.muted=false;clearInterval(state.heartbeat);if(state.presence){await sb.removeChannel(state.presence);state.presence=null}updateIdentityUI();closeModal('#profileModal');await startPresence(true);toast('Logged out on this device.')});
    $('#refreshChat').addEventListener('click',async()=>{try{await loadMessages({preserveScroll:true});toast('Chat refreshed.')}catch(err){toast(err.message)}});
    $('#pinnedToggle').addEventListener('click',()=>{$('#pinnedBanner').hidden=!$('#pinnedBanner').hidden});
    $('#viewAllPins').addEventListener('click',()=>{$('#pinnedBanner').hidden=false;$('#pinnedBanner').scrollIntoView({behavior:'smooth'})});
    $('#closePinnedBanner').addEventListener('click',()=>$('#pinnedBanner').hidden=true);
    $('#messageSearch').addEventListener('input',e=>{state.search=e.target.value.trim().toLowerCase();renderMessages()});
    setInterval(renderTyping,700);

    const info=$('#communityInfo'),side=$('#communitySidebar'),back=$('#mobileInfoBackdrop');
    const closeMobile=()=>{info.classList.remove('open');side.classList.remove('open');back.hidden=true};
    $('#mobileInfoButton').addEventListener('click',()=>{info.classList.toggle('open');side.classList.remove('open');back.hidden=!info.classList.contains('open')});
    back.addEventListener('click',closeMobile);
    $('.chat-header').addEventListener('click',e=>{if(innerWidth<=760&&e.target===$('.chat-header')){side.classList.add('open');info.classList.remove('open');back.hidden=false}});
    $$('.modal-backdrop').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)closeModal('#'+el.id)}));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&state.me)api('heartbeat').catch(()=>{})});
  }

  async function boot(){
    bindEvents();updateIdentityUI();
    try{
      await restoreIdentity();
      await loadChannel();
      await loadMessages();
      await startRealtime();
      await refreshOnlineFallback();
      startHeartbeat();
      setConnection(true);
    }catch(err){
      $('#chatLoading').innerHTML=`<p>${esc(err.message||'Could not connect to community.')}</p>`;
      setConnection(false);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();