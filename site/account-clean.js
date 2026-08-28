(() => {
  'use strict';

  const AVATARS = ['aurora','orbit','bloom','wave','ember','mono','pixel'];
  let selected = 'aurora';

  const normalize = value => {
    const raw = String(value || '').toLowerCase();
    if (AVATARS.includes(raw)) return raw;
    let h = 2166136261;
    for (let i=0;i<raw.length;i++) { h ^= raw.charCodeAt(i); h = Math.imul(h, 16777619); }
    return AVATARS[Math.abs(h) % AVATARS.length];
  };
  const src = id => `assets/avatars/${id}.svg`;

  function syncHeader(){
    const avatar = document.querySelector('#accountAvatar');
    if (!avatar) return;
    avatar.textContent = '';
    avatar.style.background = '';
    avatar.style.backgroundImage = `url(${src(selected)})`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  }

  function syncChoices(){
    document.querySelectorAll('[data-dlavie-avatar]').forEach(button => {
      const active = button.dataset.dlavieAvatar === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    syncHeader();
  }

  function setAvatar(value){
    selected = normalize(value);
    syncChoices();
    return selected;
  }

  function selectedAvatar(){ return selected; }

  function buildPicker(){
    const oldInput = document.querySelector('#profileAvatarUrl');
    const oldLabel = oldInput?.closest('label');
    if (!oldLabel || document.querySelector('.avatar-setting')) return;

    const wrap = document.createElement('div');
    wrap.className = 'avatar-setting';
    wrap.innerHTML = `
      <div class="avatar-setting-head">
        <div><strong>DLavie avatar</strong><span>Choose one of the official built-in avatars.</span></div>
        <button class="avatar-shuffle" type="button" id="avatarShuffle">Shuffle</button>
      </div>
      <div class="avatar-grid" role="group" aria-label="Choose DLavie avatar">
        ${AVATARS.map(id => `<button class="avatar-choice" type="button" data-dlavie-avatar="${id}" aria-label="${id}" aria-pressed="false"><img src="${src(id)}" alt=""></button>`).join('')}
      </div>`;
    oldLabel.replaceWith(wrap);

    wrap.querySelectorAll('[data-dlavie-avatar]').forEach(button => {
      button.addEventListener('click', () => setAvatar(button.dataset.dlavieAvatar));
    });
    wrap.querySelector('#avatarShuffle')?.addEventListener('click', () => {
      const options = AVATARS.filter(id => id !== selected);
      setAvatar(options[Math.floor(Math.random() * options.length)] || AVATARS[0]);
    });
    syncChoices();
  }

  function polishText(){
    const signOut = document.querySelector('#signOutButton');
    if (signOut) signOut.textContent = 'Sign out';
    const profileCopy = document.querySelector('[data-account-panel="profile"] .panel-head h2');
    if (profileCopy) profileCopy.textContent = 'Profile';
  }

  window.DLavieAccountUI = { setAvatar, selectedAvatar, avatars:[...AVATARS] };

  const init = () => { buildPicker(); polishText(); syncChoices(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
