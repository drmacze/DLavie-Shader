(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const icon=(path)=>`<svg viewBox="0 0 24 24" aria-hidden="true" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"><path d="${path}"/></svg>`;
  function text(el,value){if(el)el.textContent=value}
  function replaceTextNodes(root,replacements){if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode())){let v=n.textContent;replacements.forEach(([a,b])=>v=v.replace(a,b));n.textContent=v}}
  function polishNav(){
    const links=$$('.desktop-links a');
    links.forEach(a=>{const key=a.dataset.routeLink;if(key==='home'){a.href='index.html';text(a,'Beranda')}if(key==='downloads')text(a,'Project');if(key==='news')text(a,'Update');if(key==='community')text(a,'Komunitas')});
    text($('.header-actions .quiet-button'),'Feedback');
    $('#searchOpen')?.setAttribute('aria-label','Cari');
  }
  function polishDownloads(){
    const page=$('.page[data-route="downloads"]');if(!page)return;
    text($('.page-head .eyebrow',page),'PROJECT DLAVIE');text($('.page-head h1',page),'Project');
    const p=$('.page-head>p:last-child',page);if(p)p.textContent='Project Minecraft yang dirilis DLavie. Cek platform, versi, dan kompatibilitas sebelum mengunduh.';
    const input=$('#projectSearch');if(input)input.placeholder='Cari project...';
    const row=$('.project-row',page);if(row){const desc=$('.project-row-copy p',row);if(desc)desc.textContent='Shader Vibrant Visuals + PBR untuk Minecraft Bedrock dengan preset performa mobile.';const latest=$('.project-row-meta span',row);if(latest)latest.textContent='Terbaru'}
  }
  function polishProject(){
    const page=$('.page[data-route="project"]');if(!page)return;
    text($('.project-identity .eyebrow',page),'DLAVIE · MINECRAFT BEDROCK');
    const summary=$('.project-identity>p:last-child',page);if(summary)summary.textContent='Shader Vibrant Visuals + PBR yang fokus pada visual natural, volumetric godrays, dan preset Low hingga Ultra untuk perangkat Bedrock.';
    const tabs=$$('#projectTabs [data-project-tab]',page);tabs.forEach(b=>{const k=b.dataset.projectTab;if(k==='description')text(b,'Ringkasan');if(k==='changelog')text(b,'Perubahan');if(k==='versions')text(b,'Versi');if(k==='license')text(b,'Lisensi')});
    $('#downloadLatest')?.setAttribute('aria-label','Download versi terbaru');$('#copyProjectLink')?.setAttribute('aria-label','Salin link project');$('#projectMore')?.setAttribute('aria-label','Opsi lainnya');
    replaceTextNodes($('.project-stats',page),[[' downloads',' unduhan'],[' stars',' bintang'],['Updated ','Diperbarui ']]);
    const desc=$('[data-tab-panel="description"] .content-card',page);if(desc)desc.innerHTML='<h2>Tentang DLavie Shader</h2><p class="lead">Project shader/resource pack Minecraft Bedrock yang dibangun di atas pipeline resmi Vibrant Visuals dan PBR.</p><p>Arah visualnya menjaga identitas vanilla sambil memperkuat pencahayaan, atmosfer, langit, material, dan volumetric light agar terasa lebih sinematik tanpa kehilangan karakter Minecraft.</p><hr><h3>Yang membedakan</h3><ul><li><strong>Material tetap terasa vanilla.</strong> PBR menambah kedalaman tanpa mengganti identitas tekstur asli.</li><li><strong>Godrays mengikuti bentuk dunia.</strong> Cahaya dapat muncul melalui daun, jendela, atap, celah gua, dan terrain.</li><li><strong>Empat preset nyata.</strong> Low, Medium, High, dan Ultra memakai konfigurasi resource yang berbeda.</li><li><strong>Mobile-first.</strong> Fitur visual disusun dengan tier performa dan batas thermal perangkat mobile.</li></ul><h3>Cara memasang</h3><ol><li>Download file <code>.mcpack</code> dari versi yang kamu inginkan.</li><li>Buka file menggunakan Minecraft Bedrock.</li><li>Aktifkan DLavie Shader di Global Resources atau Resource Packs world.</li><li>Aktifkan Vibrant Visuals di pengaturan Video.</li><li>Pilih preset Low, Medium, High, atau Ultra dari Pack Settings.</li></ol>';
    const vt=$('[data-tab-panel="versions"] .versions-toolbar',page);if(vt){text($('h2',vt),'Versi');text($('p',vt),'Riwayat build DLavie Shader.');text($('#refreshRelease'),'Periksa release terbaru')}
    const license=$('[data-tab-panel="license"]',page);if(license){const h=$('.license-head h2',license);text(h,'Lisensi MIT');const link=$('.license-head a',license);if(link)link.textContent='Lihat sumber ↗'}
    const side=$$('.project-sidebar .side-card',page);side.forEach(card=>{const h=$('h3',card);if(!h)return;const key=h.textContent.trim().toLowerCase();if(key==='compatibility'){text(h,'Kompatibilitas');const p=$('p',card);if(p)p.textContent='Minecraft Bedrock Edition';const h4=$('h4',card);text(h4,'Perangkat target')}if(key==='links'){text(h,'Tautan');$$('.side-links a',card).forEach(a=>{const raw=a.textContent;if(/Report issues/i.test(raw))a.innerHTML=`${icon('M12 3 3 7v6c0 5 3.8 8 9 8s9-3 9-8V7l-9-4ZM9 12h6M12 9v6')}<span>Laporkan masalah</span><b>↗</b>`;else if(/View source/i.test(raw))a.innerHTML=`${icon('M8 9 3 12l5 3M16 9l5 3-5 3M14 5l-4 14')}<span>Lihat source</span><b>↗</b>`;else a.innerHTML=`${icon('M4 5h16v11H9l-5 4V5ZM8 9h8M8 12h5')}<span>Kirim feedback</span><b>→</b>`})}if(key==='tags')text(h,'Tag')});
    const menu=$('#projectMenu');if(menu){menu.innerHTML=`<a href="https://github.com/drmacze/DLavie-Shader" target="_blank" rel="noreferrer">${icon('M8 9 3 12l5 3M16 9l5 3-5 3M14 5l-4 14')}<span>Lihat source</span></a><a href="https://github.com/drmacze/DLavie-Shader/issues/new" target="_blank" rel="noreferrer">${icon('M12 9v4M12 17h.01M10 3h4l8 15H2L10 3Z')}<span>Laporkan masalah</span></a><button type="button" id="copyPermanent">${icon('M9 15 15 9M8 7l2-2a4 4 0 0 1 6 5l-1 1M9 13l-1 1a4 4 0 1 0 6 5l2-2')}<span>Salin link permanen</span></button>`;$('#copyPermanent',menu)?.addEventListener('click',()=>navigator.clipboard?.writeText(location.href).catch(()=>{}))}
  }
  function polishOtherPages(){
    const news=$('.page[data-route="news"]');if(news){text($('.page-head .eyebrow',news),'PERKEMBANGAN DLAVIE');text($('.page-head h1',news),'Update');const p=$('.page-head>p:last-child',news);if(p)p.textContent='Perubahan penting, rilis baru, dan perkembangan project DLavie.'}
    const feedback=$('.page[data-route="feedback"]');if(feedback){text($('.page-head .eyebrow',feedback),'MASUKAN');text($('.page-head h1',feedback),'Bantu kami memperbaiki DLavie');const p=$('.page-head>p:last-child',feedback);if(p)p.textContent='Laporkan bug, masalah download, atau ide perbaikan dengan informasi yang cukup agar mudah ditindaklanjuti.'}
    const vote=$('.page[data-route="vote"]');if(vote){text($('.page-head .eyebrow',vote),'ROADMAP');text($('.page-head h1',vote),'Pilih fokus berikutnya');const p=$('.page-head>p:last-child',vote);if(p)p.textContent='Pilih area yang paling ingin kamu lihat dikembangkan berikutnya.'}
  }
  function polishSearchAndSheet(){
    const input=$('#globalSearch');if(input)input.placeholder='Cari project, versi, atau halaman...';
    const sheet=$('#mobileSheet');if(sheet){$$('a,button',sheet).forEach(el=>{const t=el.textContent.trim().toLowerCase();if(t==='home')text(el,'Beranda');if(t==='projects')text(el,'Project');if(t==='news')text(el,'Update');if(t==='community')text(el,'Komunitas')})}
  }
  function init(){polishNav();polishDownloads();polishProject();polishOtherPages();polishSearchAndSheet()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
