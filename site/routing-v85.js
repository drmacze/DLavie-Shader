(()=>{'use strict';
function fix(){document.querySelectorAll('a[href*="#community"],[data-route-link="community"]').forEach(a=>{a.setAttribute('href','community.html?v=85')});document.querySelectorAll('a[href*="app.html"][href*="#community"]').forEach(a=>a.setAttribute('href','community.html?v=85'))}
function route(){const h=(location.hash||'').replace(/^#\/?/,'').split('/')[0];if(h==='community')location.replace('community.html?v=85')}
fix();route();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{fix();route()},{once:true});new MutationObserver(fix).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',route,{passive:true});
})();