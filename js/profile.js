/*
 * Creator profile page (profile.html). Text and links live in GUERNICA_CONTENT.PROFILE
 * in content.js. Shares the language choice with the puzzle (localStorage "guernica.lang").
 * Plain script so it works from file:// like the rest of the site.
 */
(function () {
  'use strict';

  const CFG = Object.assign({ defaultLang: 'es', idleResetSeconds: 120 }, window.PUZZLE_CONFIG || {});
  const { UI, PROFILE } = window.GUERNICA_CONTENT;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rich = (s) => esc(s).replace(/_(.+?)_/g, '<em>$1</em>');
  const store = {
    get(k) { try { return localStorage.getItem('guernica.' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('guernica.' + k, v); } catch (e) { /* private mode */ } }
  };
  // Shown under each link label: the address without "https://www." and trailing slash.
  const pretty = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

  // Links don't depend on the language.
  const L = PROFILE.links;
  [['portfolio', L.portfolio], ['linkedin', L.linkedin], ['github', L.github]].forEach(([k, url]) => {
    const a = $('#link-' + k);
    a.href = url;
    a.querySelector('small').textContent = pretty(url);
  });
  $('#link-email').href = 'mailto:' + L.email;
  $('#link-email small').textContent = L.email;
  $('#profile-name').textContent = PROFILE.name;

  function setLang(lang) {
    if (!PROFILE[lang] || !UI[lang]) return;
    store.set('lang', lang);
    const P = PROFILE[lang];
    document.documentElement.lang = lang;
    document.title = `${PROFILE.name} · ${UI[lang].title}`;
    $$('[data-i18n]').forEach((el) => { el.textContent = UI[lang][el.dataset.i18n]; });
    $$('[data-p]').forEach((el) => { el.textContent = P[el.dataset.p]; });
    $('#profile-about').innerHTML = P.about.map((p) => `<p>${rich(p)}</p>`).join('');
    $('#profile-why').innerHTML = P.why.map((p) => `<p>${rich(p)}</p>`).join('');
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  const saved = store.get('lang');
  setLang(PROFILE[saved] ? saved : (PROFILE[CFG.defaultLang] ? CFG.defaultLang : 'es'));

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (e.key === 'Escape') location.href = 'index.html';
    else if (e.key.toLowerCase() === 'l') setLang(document.documentElement.lang === 'es' ? 'en' : 'es');
  });

  // Kiosk: if a visitor walks away from this page, go back to the puzzle's start screen.
  if (CFG.idleResetSeconds > 0) {
    let last = Date.now();
    ['pointerdown', 'pointermove', 'wheel', 'touchstart', 'keydown', 'scroll'].forEach((ev) =>
      window.addEventListener(ev, () => { last = Date.now(); }, { passive: true, capture: true }));
    setInterval(() => {
      if (Date.now() - last > CFG.idleResetSeconds * 1000) location.href = 'index.html';
    }, 5000);
  }
})();
