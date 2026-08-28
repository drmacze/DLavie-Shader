(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  const icons={
    overview:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>',
    saved:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h12v16l-6-3.6-6 3.6z"/></svg>',
    profile:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20c.7-3.5 3.2-5.5 7.5-5.5s6.8 2 7.5 5.5"/></svg>',
    security:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5.5 5.7v5.7c0 4.1 2.4 7.6 6.5 9.6 4.1-2 6.5-5.5 6.5-9.6V5.7zM9.4 12l1.7 1.7 3.7-4"/></svg>',
    preferences:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M7 14v6"/></svg>',
    data:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>'
  };
  const navLabels={overview:'Ringkasan',saved:'Tersimpan',profile:'Profil',security:'Keamanan',preferences:'Preferensi',data:'Data & privasi'};

  function setText(selector,text,root=document){const el=$(selector,root);if(el)el.textContent=text;}
  function setPlaceholder(selector,text){const el=$(selector);if(el)el.placeholder=text;}
  function setLabel(inputSelector,text){const input=$(inputSelector);const label=input?.closest('label');const span=label?.querySelector(':scope > span');if(span)span.textContent=text;}

  function localizeHeader(){
    setText('.account-brand span','akun');
    setText('.top-actions a[href="community.html"]','Komunitas');
    setText('.top-actions a[href="./#home"]','Beranda');
  }

  function localizeAuth(){
    const intro=$('.auth-intro');
    if(intro){
      setText('.kicker','AKUN DLAVIE',intro);
      const h=intro.querySelector('h1');if(h)h.innerHTML='Masuk ke<br>DLavie.';
      setText(':scope > p','Kelola profil, simpan project, ikut komunitas, dan atur keamanan akun dari satu tempat.',intro);
      const rows=$$('.feature-stack > div',intro);
      const copy=[
        ['Profil & project','Profil, avatar, dan project tersimpan tetap terhubung ke akunmu.'],
        ['Komunitas','Gunakan identitas yang sama saat berdiskusi dan memberi reaksi.'],
        ['Privasi & keamanan','Atur password, sesi, export data, atau hapus akun kapan saja.']
      ];
      rows.forEach((row,i)=>{if(!copy[i])return;setText('strong',copy[i][0],row);setText('p',copy[i][1],row);});
    }

    setText('[data-auth-tab="login"]','Masuk');
    setText('[data-auth-tab="register"]','Buat akun');

    const login=$('#loginForm');
    if(login){setText('.form-head h2','Selamat datang kembali',login);setText('.form-head p','Masukkan email dan password akun DLavie.',login);setLabel('#loginEmail','Email');setLabel('#loginPassword','Password');setPlaceholder('#loginEmail','nama@email.com');setPlaceholder('#loginPassword','Masukkan password');setText('button[type="submit"]','Masuk',login);setText('#forgotPassword','Lupa password?');}

    const register=$('#registerForm');
    if(register){
      setText('.form-head h2','Buat akun DLavie',register);setText('.form-head p','Isi data berikut. Setelah daftar, cek email untuk verifikasi akun.',register);
      setLabel('#registerUsername','Username');setLabel('#registerDisplayName','Nama tampilan');setLabel('#registerEmail','Email');setLabel('#registerPassword','Password');setLabel('#registerConfirm','Ulangi password');
      setPlaceholder('#registerUsername','username');setPlaceholder('#registerDisplayName','Nama yang dilihat orang lain');setPlaceholder('#registerEmail','nama@email.com');setPlaceholder('#registerPassword','Minimal 10 karakter');setPlaceholder('#registerConfirm','Ulangi password');
      setText('#usernameStatus','3–24 karakter: huruf kecil, angka, atau underscore.');setText('#passwordHint','Gunakan kombinasi huruf, angka, dan simbol agar password lebih kuat.');
      const terms=$('#termsAccept')?.closest('label')?.querySelector('span');if(terms)terms.textContent='Saya setuju dengan aturan komunitas dan ketentuan akun DLavie.';
      setText('button[type="submit"]','Buat akun',register);
    }

    const reset=$('#resetRequestForm');
    if(reset){setText('.form-head h2','Lupa password?',reset);setText('.form-head p','Masukkan email akun. Kami akan mengirim tautan untuk membuat password baru.',reset);setLabel('#resetEmail','Email akun');setPlaceholder('#resetEmail','nama@email.com');setText('button[type="submit"]','Kirim tautan pemulihan',reset);setText('[data-back-login]','Kembali ke halaman masuk',reset);}
    const recovery=$('#resetPasswordForm');
    if(recovery){setText('.form-head h2','Buat password baru',recovery);setText('.form-head p','Gunakan password baru yang belum pernah dipakai di akun ini.',recovery);setLabel('#recoveryPassword','Password baru');setLabel('#recoveryConfirm','Ulangi password baru');setText('button[type="submit"]','Simpan password baru',recovery);}

    addAuthHints();
    updateAuthFlow();
  }

  function addAuthHints(){
    const card=$('.auth-card');const tabs=$('#authTabs');
    if(card&&tabs&&!$('.auth-flow-note',card))tabs.insertAdjacentHTML('beforebegin','<div class="auth-flow-note" id="authFlowNote"></div>');
    const login=$('#loginForm');
    if(login&&!$('.auth-inline-hint',login)) login.insertAdjacentHTML('beforeend','<p class="auth-inline-hint">Belum punya akun? <button type="button" data-go-register>Buat akun DLavie</button></p>');
    const register=$('#registerForm');
    if(register&&!$('.auth-inline-hint',register)) register.insertAdjacentHTML('beforeend','<p class="auth-inline-hint">Sudah punya akun? <button type="button" data-go-login>Masuk</button></p>');
    $('[data-go-register]')?.addEventListener('click',()=> $('[data-auth-tab="register"]')?.click());
    $('[data-go-login]')?.addEventListener('click',()=> $('[data-auth-tab="login"]')?.click());
  }

  function updateAuthFlow(){
    const note=$('#authFlowNote');if(!note)return;
    const register=!$('#registerForm')?.hidden;
    const reset=!$('#resetRequestForm')?.hidden||!$('#resetPasswordForm')?.hidden;
    if(reset) note.innerHTML='<span><i></i>Pemulihan akun</span><b>Gunakan email akunmu</b>';
    else if(register) note.innerHTML='<span><i></i>1. Buat akun</span><b>2. Verifikasi email → 3. Selesai</b>';
    else note.innerHTML='<span><i></i>Masuk aman</span><b>Lanjutkan ke akunmu</b>';
  }

  function localizeAccount(){
    setText('#signOutButton','Keluar');
    setText('[data-account-panel="profile"] .kicker','PROFIL PUBLIK');
    setText('[data-account-panel="profile"] .panel-head h2','Profil');
    setText('#profileForm label:nth-of-type(1) > span','Nama tampilan');
    setText('#profileForm label:nth-of-type(2) > span','Bio');
    setPlaceholder('#profileBio','Ceritakan sedikit tentang dirimu.');
    setText('#profileForm button[type="submit"]','Simpan profil');
    const userCopy=$('#usernameForm .setting-copy');if(userCopy){setText('h3','Username',userCopy);setText('p','Username adalah alamat unik akunmu. Setelah diganti, username baru terkunci selama 24 jam.',userCopy);}
    setText('#usernameForm label > span','Username baru');setText('#usernameForm button[type="submit"]','Ganti username');

    const sec=$('[data-account-panel="security"]');
    if(sec){setText('.kicker','KEAMANAN AKUN',sec);setText('.panel-head h2','Keamanan',sec);const sections=$$('.setting-copy',sec);if(sections[0]){setText('h3','Alamat email',sections[0]);setText('p','Jika email diganti, kamu perlu mengonfirmasi alamat email yang baru.',sections[0]);}if(sections[1]){setText('h3','Ganti password',sections[1]);setText('p','Masukkan password saat ini terlebih dahulu untuk memastikan ini benar-benar kamu.',sections[1]);}setPlaceholder('#newEmail','emailbaru@contoh.com');setText('#emailForm button','Ganti email');setText('#resendVerification','Kirim ulang email verifikasi');setLabel('#currentPassword','Password saat ini');setLabel('#newPassword','Password baru');setLabel('#newPasswordConfirm','Ulangi password baru');setText('#passwordForm button[type="submit"]','Simpan password');setText('#signOutAll','Keluar dari semua perangkat');}

    const pref=$('[data-account-panel="preferences"]');
    if(pref){setText('.kicker','PREFERENSI',pref);setText('.panel-head h2','Preferensi',pref);const toggles=$$('.toggle-setting',pref);if(toggles[0]){setText('strong','Notifikasi komunitas',toggles[0]);setText('span','Izinkan DLavie menampilkan aktivitas komunitas pada fitur notifikasi.',toggles[0]);}if(toggles[1]){setText('strong','Notifikasi email',toggles[1]);setText('span','Terima email non-keamanan tentang project dan komunitas.',toggles[1]);}setText('#preferencesForm > button[type="submit"]','Simpan preferensi');}

    const data=$('[data-account-panel="data"]');
    if(data){setText('.kicker','DATA & PRIVASI',data);setText('.panel-head h2','Data & privasi',data);const action=$('.privacy-action',data);if(action){setText('h3','Export data akun',action);setText('p','Unduh arsip JSON berisi profil, aktivitas akun, project tersimpan, dan data lokal yang tersedia di perangkat ini.',action);setText('button','Export data',action);}const danger=$('.danger-zone',data);if(danger){const kick=$('.kicker',danger);if(kick)kick.textContent='HAPUS AKUN';setText('h3','Hapus akun DLavie',danger);setText('p','Akun login dan profil pribadimu akan dihapus permanen. Pesan komunitas yang sudah ada hanya dipertahankan sebagai riwayat anonim.',danger);setText('#deleteAccount','Hapus akun secara permanen',danger);}}

    const side=$('.account-side');
    if(side){const cards=$$('.side-card',side);if(cards[0]){setText('.kicker','INFO AKUN',cards[0]);const dts=$$('dt',cards[0]);if(dts[0])dts[0].textContent='Dibuat';if(dts[1])dts[1].textContent='Email';if(dts[2])dts[2].textContent='Peran komunitas';}if(cards[1]){setText('.kicker','TAUTAN CEPAT',cards[1]);const links=$$('a',cards[1]);if(links[0])links[0].childNodes[0].nodeValue='Buka komunitas ';if(links[1])links[1].childNodes[0].nodeValue='DLavie Shader ';if(links[2])links[2].childNodes[0].nodeValue='Kirim feedback ';}}
  }

  function buildAccountNavigation(){
    const tabs=$('.account-tabs');const grid=$('.dashboard-grid');
    if(!tabs||!grid)return;
    if(!$('.account-workspace')){
      const wrap=document.createElement('div');wrap.className='account-workspace';tabs.parentNode.insertBefore(wrap,tabs);wrap.append(tabs,grid);
    }
    if(!$('.account-nav-title',tabs))tabs.insertAdjacentHTML('afterbegin','<div class="account-nav-title">Pengaturan akun</div>');
    $$('button[data-panel]',tabs).forEach(button=>{
      const key=button.dataset.panel;const label=navLabels[key]||button.textContent.trim();
      button.innerHTML=`<i class="account-nav-icon">${icons[key]||''}</i><span>${label}</span>`;
      button.setAttribute('aria-label',label);
    });
    const sign=$('#signOutButton');
    if(sign&&!$('.account-nav-signout',tabs)){
      const holder=document.createElement('div');holder.className='account-nav-signout';holder.appendChild(sign);tabs.appendChild(holder);sign.textContent='Keluar dari akun';
    }
  }

  function translateStatusText(text){
    const raw=String(text||'');
    const rules=[
      [/Invalid login credentials/i,'Email atau password salah. Coba periksa lagi.'],
      [/Email not confirmed/i,'Email belum diverifikasi. Cek inbox lalu buka tautan verifikasi.'],
      [/User already registered/i,'Email ini sudah terdaftar. Silakan masuk.'],
      [/Password should be at least/i,'Password terlalu pendek. Gunakan password yang lebih kuat.'],
      [/Please sign in first\.?/i,'Silakan masuk terlebih dahulu.'],
      [/Please wait…?/i,'Memproses…'],
      [/Could not load account data\.?/i,'Data akun belum bisa dimuat. Coba beberapa saat lagi.'],
      [/Sign in failed\.?/i,'Tidak bisa masuk. Periksa email dan passwordmu.'],
      [/Registration failed\.?/i,'Akun belum berhasil dibuat. Periksa data lalu coba lagi.']
    ];
    for(const [re,replacement] of rules)if(re.test(raw))return replacement;
    return raw;
  }

  function watchMessages(){
    const targets=[$('#authMessage'),$('#accountToast')].filter(Boolean);
    targets.forEach(el=>new MutationObserver(()=>{const next=translateStatusText(el.textContent);if(next!==el.textContent)el.textContent=next;}).observe(el,{childList:true,subtree:true,characterData:true}));
    new MutationObserver(()=>{
      $$('button').forEach(b=>{if(/^Please wait/i.test(b.textContent))b.textContent='Memproses…';});
      updateAuthFlow();
    }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  }

  function bind(){
    localizeHeader();localizeAuth();localizeAccount();buildAccountNavigation();watchMessages();
    window.addEventListener('hashchange',()=>setTimeout(buildAccountNavigation,0));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
