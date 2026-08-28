(() => {
  'use strict';
  const URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const API=`${URL}/functions/v1/dlavie-account`;
  const DOWNLOAD_KEY='dlavie.download.history.v1';
  let client=null;

  function localHistory(){
    try{const x=JSON.parse(localStorage.getItem(DOWNLOAD_KEY)||'[]');return Array.isArray(x)?x:[];}catch{return [];}
  }
  function toast(text){
    const el=document.querySelector('#accountToast');if(!el)return;
    el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200);
  }
  async function exportAll(event){
    event.preventDefault();event.stopImmediatePropagation();
    const button=event.currentTarget;button.disabled=true;
    try{
      client ||= window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
      const {data}=await client.auth.getSession();const session=data?.session;
      if(!session)throw new Error('Silakan masuk terlebih dahulu.');
      const [server,saved]=await Promise.all([
        fetch(API,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({action:'export_account'})}).then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j?.error?.message||'Export gagal.');return j.data;}),
        client.from('dlavie_saved_projects').select('project_slug,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false})
      ]);
      if(saved.error)throw saved.error;
      const out={
        exported_at:new Date().toISOString(),
        ...server,
        saved_projects:saved.data||[],
        device_local_data:{
          note:'Riwayat download ini berasal dari browser/perangkat yang sedang dipakai dan tidak disimpan di server DLavie.',
          download_history:localHistory()
        }
      };
      const username=server?.profile?.username||server?.account?.username||'account';
      const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`dlavie-account-${username}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      toast('Export lengkap berhasil dibuat.');
    }catch(error){toast(error.message||'Export gagal.');}
    finally{button.disabled=false;}
  }
  function bind(){document.querySelector('#exportData')?.addEventListener('click',exportAll,true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
