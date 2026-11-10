/*
 * Guernica puzzle engine.
 * Plain script (no modules) so index.html works when opened straight from disk.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- config
  const CFG = Object.assign({
    image: 'assets/guernica.jpg',
    cols: 6, rows: 3,
    snapTolerance: 0.28,
    completionSound: 'assets/audio/complete.mp3',
    volume: 0.9, soundEnabled: true, snapSound: true,
    defaultLang: 'es',
    ghostOpacity: 0.10, hintOpacity: 0.45,
    idleResetSeconds: 120
  }, window.PUZZLE_CONFIG || {});

  const { UI, CARDS, FINALE } = window.GUERNICA_CONTENT;
  const N = CFG.cols * CFG.rows;

  // ---------------------------------------------------------------- helpers
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Escaped text plus _italics_ for titles of works (RAE: titles go in cursiva).
  const rich = (s) => esc(s).replace(/_(.+?)_/g, '<em>$1</em>');
  const store = {
    get(k) { try { return localStorage.getItem('guernica.' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('guernica.' + k, v); } catch (e) { /* private mode */ } }
  };
  function t(key, vars) {
    const s = (UI[state.lang] && UI[state.lang][key]) || UI.es[key] || key;
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : '')) : s;
  }
  function fmtTime(ms) {
    const s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  // ---------------------------------------------------------------- DOM
  const stage = $('#stage');
  const boardCv = $('#board');
  const toast = $('#toast');
  const hitCtx = document.createElement('canvas').getContext('2d');

  // ---------------------------------------------------------------- state
  const savedLang = store.get('lang');
  const state = {
    lang: UI[savedLang] ? savedLang : (UI[CFG.defaultLang] ? CFG.defaultLang : 'es'),
    pieces: [],
    placed: 0,
    moves: 0,
    startedAt: null,
    elapsed: 0,
    timerId: null,
    running: false,
    complete: false,
    hint: false,
    revealed: 0,
    selected: null,
    zTop: 10,
    lastActivity: Date.now()
  };
  let geo = null;
  const drags = new Map();
  const img = new Image();

  // ================================================================ geometry
  // Knob shape as cubic Bézier segments in (t along edge, n outward) units of
  // the piece's short side. Symmetric around t = 0.5.
  const KNOB = [
    [0.40, 0.02, 0.42, 0.06, 0.38, 0.12],
    [0.33, 0.20, 0.42, 0.27, 0.50, 0.27],
    [0.58, 0.27, 0.67, 0.20, 0.62, 0.12],
    [0.58, 0.06, 0.60, 0.02, 0.64, 0.00]
  ];

  function edgeTo(path, x0, y0, x1, y1, tab, s) {
    if (!tab) { path.lineTo(x1, y1); return; }
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L;
    const nx = uy * tab, ny = -ux * tab;            // outward normal (clockwise path)
    const P = (tt, n) => {
      const along = L / 2 + (tt - 0.5) * s, out = n * s;
      return [x0 + ux * along + nx * out, y0 + uy * along + ny * out];
    };
    path.lineTo(...P(0.36, 0));
    for (const k of KNOB) {
      const a = P(k[0], k[1]), b = P(k[2], k[3]), c = P(k[4], k[5]);
      path.bezierCurveTo(a[0], a[1], b[0], b[1], c[0], c[1]);
    }
    path.lineTo(x1, y1);
  }

  function piecePath(p, ox, oy) {
    const { pw, ph, s } = geo;
    const path = new Path2D();
    path.moveTo(ox, oy);
    edgeTo(path, ox, oy, ox + pw, oy, p.tabs[0], s);
    edgeTo(path, ox + pw, oy, ox + pw, oy + ph, p.tabs[1], s);
    edgeTo(path, ox + pw, oy + ph, ox, oy + ph, p.tabs[2], s);
    edgeTo(path, ox, oy + ph, ox, oy, p.tabs[3], s);
    path.closePath();
    return path;
  }

  function computeGeometry() {
    const r = stage.getBoundingClientRect();
    const W = r.width, H = r.height;
    if (!W || !H || !img.naturalWidth) return null;
    const aspect = img.naturalWidth / img.naturalHeight;
    const targetW = Math.min(W * 0.72, H * 0.58 * aspect);
    const pw = Math.max(16, Math.floor(targetW / CFG.cols));
    const ph = Math.max(16, Math.floor(targetW / aspect / CFG.rows));
    const bw = pw * CFG.cols, bh = ph * CFG.rows;
    const s = Math.min(pw, ph);
    return {
      W, H, pw, ph, bw, bh, s,
      bx: Math.round((W - bw) / 2),
      by: Math.round(clamp(H * 0.06, 12, 48)),
      pad: Math.ceil(s * 0.3),
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    };
  }

  // ================================================================ rendering
  function drawBoard() {
    if (!geo) return;
    const { bw, bh, bx, by, dpr, pw, ph } = geo;
    boardCv.width = Math.round(bw * dpr);
    boardCv.height = Math.round(bh * dpr);
    boardCv.style.width = bw + 'px';
    boardCv.style.height = bh + 'px';
    boardCv.style.transform = `translate(${bx}px, ${by}px)`;
    const ctx = boardCv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#121210';
    ctx.fillRect(0, 0, bw, bh);
    ctx.globalAlpha = state.complete ? 1 : (state.hint ? CFG.hintOpacity : CFG.ghostOpacity);
    ctx.drawImage(img, 0, 0, bw, bh);
    ctx.globalAlpha = 1;
    if (!state.complete) {
      ctx.strokeStyle = 'rgba(233,228,216,0.10)';
      ctx.lineWidth = 1;
      for (const p of state.pieces) ctx.stroke(piecePath(p, p.c * pw, p.r * ph));
    }
  }

  function renderPiece(p) {
    const { pw, ph, pad, dpr, bw, bh, s } = geo;
    const W = pw + 2 * pad, H = ph + 2 * pad;
    const cv = p.el;
    cv.width = Math.ceil(W * dpr);
    cv.height = Math.ceil(H * dpr);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const path = piecePath(p, pad, pad);
    p.path = path;

    ctx.save();
    ctx.clip(path);
    ctx.drawImage(img, pad - p.c * pw, pad - p.r * ph, bw, bh);
    if (!p.placed) {
      // bevel: dark lower-right, light upper-left
      ctx.lineWidth = Math.max(2, s * 0.035);
      ctx.translate(1.2, 1.2);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.stroke(path);
      ctx.translate(-2.4, -2.4);
      ctx.strokeStyle = 'rgba(255,255,255,0.30)';
      ctx.stroke(path);
    }
    ctx.restore();
    if (!p.placed) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.stroke(path);
    }
  }

  function bodyXY(p) { return [geo.bx + p.ux * geo.pw, geo.by + p.uy * geo.ph]; }

  function position(p) {
    const [x, y] = bodyXY(p);
    p.el.style.transform = `translate3d(${x - geo.pad}px, ${y - geo.pad}px, 0)`;
  }

  function clampPiece(p) {
    if (p.placed) return;
    const [x, y] = bodyXY(p);
    const nx = clamp(x, 0, Math.max(0, geo.W - geo.pw));
    const ny = clamp(y, 0, Math.max(0, geo.H - geo.ph));
    p.ux = (nx - geo.bx) / geo.pw;
    p.uy = (ny - geo.by) / geo.ph;
  }

  function layout() {
    const g = computeGeometry();
    if (!g) return;
    geo = g;
    drawBoard();
    for (const p of state.pieces) { renderPiece(p); clampPiece(p); position(p); }
  }

  // ================================================================ game setup
  function buildPieces() {
    for (const p of state.pieces) p.el.remove();
    const { rows, cols } = CFG;
    const flip = () => (Math.random() < 0.5 ? 1 : -1);
    const h = [], v = [];
    for (let r = 0; r < rows - 1; r++) { h[r] = []; for (let c = 0; c < cols; c++) h[r][c] = flip(); }
    for (let r = 0; r < rows; r++) { v[r] = []; for (let c = 0; c < cols - 1; c++) v[r][c] = flip(); }

    state.pieces = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tabs = [
          r === 0 ? 0 : -h[r - 1][c],          // top
          c === cols - 1 ? 0 : v[r][c],        // right
          r === rows - 1 ? 0 : h[r][c],        // bottom
          c === 0 ? 0 : -v[r][c - 1]           // left
        ];
        const el = document.createElement('canvas');
        el.className = 'piece';
        el.setAttribute('aria-hidden', 'true');
        stage.insertBefore(el, toast);
        state.pieces.push({ r, c, tabs, el, ux: 0, uy: 0, placed: false, z: 0, path: null });
      }
    }
  }

  function overlapArea(a, b) {
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return w > 0 && h > 0 ? w * h : 0;
  }

  function scatter() {
    const { W, H, pw, ph, bx, by, bw, bh, pad } = geo;
    const gap = 10;
    const boardRect = { x: bx - gap, y: by - gap, w: bw + 2 * gap, h: bh + 2 * gap };
    const taken = [];
    const m = Math.min(pad * 0.6, 12);
    const order = state.pieces.slice().sort(() => Math.random() - 0.5);
    for (const p of order) {
      let best = null, bestScore = Infinity;
      for (let i = 0; i < 80; i++) {
        const rect = {
          x: m + Math.random() * Math.max(0, W - pw - 2 * m),
          y: m + Math.random() * Math.max(0, H - ph - 2 * m),
          w: pw, h: ph
        };
        let score = overlapArea(rect, boardRect) * 6;
        for (const o of taken) score += overlapArea(rect, o);
        if (score < bestScore) { bestScore = score; best = rect; }
        if (score === 0) break;
      }
      taken.push(best);
      p.ux = (best.x - bx) / pw;
      p.uy = (best.y - by) / ph;
      p.z = ++state.zTop;
      p.el.style.zIndex = p.z;
    }
  }

  function newGame(showIntro) {
    drags.clear();
    clearInterval(state.timerId);
    Object.assign(state, {
      placed: 0, moves: 0, startedAt: null, elapsed: 0, timerId: null,
      complete: false, revealed: 0, selected: null, zTop: 10
    });
    stage.classList.remove('is-complete');
    closeOverlay('#finale');
    buildPieces();
    geo = computeGeometry();
    if (!geo) return;
    scatter();
    layout();
    renderStory(false);
    updateStats();
    Sound.stop();
    if (showIntro) openIntro();
    else state.running = true;
  }

  // ================================================================ interaction
  function localPoint(e) {
    const r = stage.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  function isDragged(p) {
    for (const d of drags.values()) if (d.p === p) return true;
    return false;
  }

  function pickPiece(x, y, loose) {
    const candidates = state.pieces
      .filter((p) => !p.placed && !isDragged(p))
      .sort((a, b) => b.z - a.z);
    for (const p of candidates) {
      const [bx, by] = bodyXY(p);
      if (hitCtx.isPointInPath(p.path, x - bx + geo.pad, y - by + geo.pad)) return p;
    }
    if (loose) {                    // forgiving fallback for fingers
      const f = 10;
      for (const p of candidates) {
        const [bx, by] = bodyXY(p);
        if (x >= bx - f && x <= bx + geo.pw + f && y >= by - f && y <= by + geo.ph + f) return p;
      }
    }
    return null;
  }

  stage.addEventListener('pointerdown', (e) => {
    touchActivity();
    if (!state.running || state.complete || !geo) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const [x, y] = localPoint(e);
    const p = pickPiece(x, y, e.pointerType !== 'mouse');
    if (!p) return;
    e.preventDefault();
    const [bx, by] = bodyXY(p);
    drags.set(e.pointerId, { p, dx: x - bx, dy: y - by });
    p.z = ++state.zTop;
    p.el.style.zIndex = p.z;
    p.el.classList.remove('snapping');
    p.el.classList.add('dragging');
    try { stage.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    startTimer();
  });

  stage.addEventListener('pointermove', (e) => {
    const d = drags.get(e.pointerId);
    if (!d) return;
    const [x, y] = localPoint(e);
    const nx = clamp(x - d.dx, -geo.pw * 0.5, geo.W - geo.pw * 0.5);
    const ny = clamp(y - d.dy, -geo.ph * 0.5, geo.H - geo.ph * 0.5);
    d.p.ux = (nx - geo.bx) / geo.pw;
    d.p.uy = (ny - geo.by) / geo.ph;
    position(d.p);
  });

  function endDrag(e) {
    const d = drags.get(e.pointerId);
    if (!d) return;
    drags.delete(e.pointerId);
    const p = d.p;
    p.el.classList.remove('dragging');
    state.moves++;
    const dx = (p.ux - p.c) * geo.pw, dy = (p.uy - p.r) * geo.ph;
    if (Math.hypot(dx, dy) <= CFG.snapTolerance * geo.s) lockPiece(p);
    else { clampPiece(p); position(p); }
    updateStats();
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('contextmenu', (e) => e.preventDefault());

  function lockPiece(p) {
    p.placed = true;
    p.ux = p.c;
    p.uy = p.r;
    p.el.classList.add('snapping', 'placed');
    p.el.style.zIndex = 1;
    renderPiece(p);
    position(p);
    p.el.classList.remove('flash');
    void p.el.offsetWidth;          // restart animation
    p.el.classList.add('flash');
    setTimeout(() => p.el.classList.remove('snapping'), 260);
    Sound.click();
    onPlaced();
  }

  function revealedFor(placed) {
    return placed >= N ? CARDS.length : Math.floor(placed * CARDS.length / N);
  }

  function onPlaced() {
    state.placed++;
    const before = state.revealed;
    state.revealed = revealedFor(state.placed);
    if (state.revealed > before) {
      state.selected = null;          // follow the newest chapter
      renderStory(true, before);
      showToast(CARDS[state.revealed - 1]);
    }
    updateStats();
    if (state.placed === N) finish();
  }

  function finish() {
    state.complete = true;
    state.elapsed = performance.now() - (state.startedAt || performance.now());
    clearInterval(state.timerId);
    updateStats();
    stage.classList.add('is-complete');
    drawBoard();
    setTimeout(() => {
      Sound.playComplete();
      openFinale();
    }, 900);
  }

  // Shift+D: place one random piece (handy for demos and testing the ending).
  function demoPlace() {
    if (state.complete) return;
    if ($('#intro').classList.contains('is-open')) startPlaying();
    const left = state.pieces.filter((p) => !p.placed && !isDragged(p));
    if (!left.length) return;
    const p = left[Math.floor(Math.random() * left.length)];
    startTimer();
    state.moves++;
    p.el.classList.add('snapping');
    lockPiece(p);
    updateStats();
  }

  // ================================================================ timer & stats
  function startTimer() {
    if (state.startedAt) return;
    state.startedAt = performance.now();
    state.timerId = setInterval(updateStats, 500);
  }

  function elapsedMs() {
    if (state.complete) return state.elapsed;
    return state.startedAt ? performance.now() - state.startedAt : 0;
  }

  function updateStats() {
    $('#stat-pieces').textContent = `${state.placed}/${N}`;
    $('#stat-time').textContent = fmtTime(elapsedMs());
    $('#stat-moves').textContent = state.moves;
    $('#progress-bar').style.width = (state.revealed / CARDS.length * 100) + '%';
  }

  // ================================================================ story panel
  function poemHTML(poem, cols) {
    const lines = (arr) => arr.map(esc).join('<br>');
    let quotes = `<blockquote lang="es">${lines(poem.es)}</blockquote>`;
    if (state.lang === 'en' && poem.en) {
      quotes += `<blockquote class="translation" lang="en"><span class="label">${esc(t('translation'))}</span>${lines(poem.en)}</blockquote>`;
    }
    if (cols) quotes = `<div class="poem-cols">${quotes}</div>`;
    return `${quotes}<figcaption>— ${esc(poem.author)}, <cite>${esc(poem.work)}</cite> · ${esc(poem.year)}</figcaption>`;
  }

  function renderStory(animate, prevRevealed) {
    const L = state.lang;
    const feature = $('#feature');
    const idx = state.selected != null ? state.selected : state.revealed - 1;

    if (idx < 0) {
      feature.innerHTML = `
        <p class="eyebrow">${esc(t('chapter'))} 1 ${esc(t('of'))} ${CARDS.length}</p>
        <h3>${esc(t('emptyTitle'))}</h3>
        <p class="body empty">${esc(t('emptyBody'))}</p>`;
    } else {
      const card = CARDS[idx];
      feature.innerHTML = `
        <p class="eyebrow"><span class="tag">${esc(t('kind_' + card.kind))}</span> · ${esc(card.date[L])}</p>
        <h3>${rich(card.title[L])}</h3>
        <p class="body">${rich(card.body[L])}</p>
        ${card.poem ? `<figure class="poem">${poemHTML(card.poem)}</figure>` : ''}
        <p class="chapter-count">${esc(t('chapter'))} ${idx + 1} ${esc(t('of'))} ${CARDS.length}</p>`;
    }
    if (animate) {
      feature.classList.remove('enter');
      void feature.offsetWidth;
      feature.classList.add('enter');
      feature.scrollTop = 0;
    }

    const tl = $('#timeline');
    tl.innerHTML = CARDS.map((card, i) => {
      const open = i < state.revealed;
      const fresh = prevRevealed != null && i >= prevRevealed && i < state.revealed;
      return `<li class="${fresh ? 'just-revealed' : ''}">
        <button type="button" data-card="${i}" ${open ? '' : 'disabled'} ${i === idx ? 'aria-current="true"' : ''}>
          <span class="num">${String(i + 1).padStart(2, '0')}</span>
          <span>${open ? rich(card.title[L]) : esc(t('locked'))}</span>
        </button></li>`;
    }).join('');
    const cur = tl.querySelector('[aria-current="true"]');
    // Scroll only the list itself (scrollIntoView would also scroll the page on narrow screens).
    if (cur && animate && tl.scrollHeight > tl.clientHeight) {
      const li = cur.parentElement;
      if (li.offsetTop < tl.scrollTop || li.offsetTop + li.offsetHeight > tl.scrollTop + tl.clientHeight) {
        tl.scrollTo({ top: li.offsetTop - tl.clientHeight / 2, behavior: 'smooth' });
      }
    }
  }

  $('#timeline').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-card]');
    if (!b || b.disabled) return;
    const i = Number(b.dataset.card);
    state.selected = i === state.revealed - 1 ? null : i;
    renderStory(true);
  });

  let toastTimer = null;
  function showToast(card) {
    toast.innerHTML = `<small>${esc(t('newChapter'))}</small>${rich(card.title[state.lang])}`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // ================================================================ overlays
  function openIntro() {
    state.running = false;
    $('#intro').classList.add('is-open');
    setTimeout(() => $('#btn-start').focus({ preventScroll: true }), 50);
  }
  function startPlaying() {
    closeOverlay('#intro');
    state.running = true;
    touchActivity();
  }
  function closeOverlay(sel) { $(sel).classList.remove('is-open'); }

  function renderFinale() {
    $('#finale-body').textContent = t('completeBody', { n: CARDS.length });
    $('#finale-time').textContent = fmtTime(elapsedMs());
    $('#finale-moves').textContent = state.moves;
    $('#finale-poem').innerHTML = poemHTML(FINALE, true);
  }
  function openFinale() {
    renderFinale();
    $('#finale').classList.add('is-open');
    setTimeout(() => $('#btn-again').focus({ preventScroll: true }), 50);
  }

  $('#btn-start').addEventListener('click', startPlaying);
  $('#btn-again').addEventListener('click', () => newGame(false));
  $('#btn-read').addEventListener('click', () => closeOverlay('#finale'));
  $('#btn-restart').addEventListener('click', () => newGame(false));

  // ================================================================ language
  function setLang(lang) {
    if (!UI[lang]) return;
    state.lang = lang;
    store.set('lang', lang);
    document.documentElement.lang = lang;
    document.title = `${t('title')} · ${t('subtitle')}`;
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-title]').forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
      el.setAttribute('aria-label', el.title);
    });
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $('#idle-note').textContent = CFG.idleResetSeconds > 0 ? t('idleNote', { s: CFG.idleResetSeconds }) : '';
    renderStory(false);
    if ($('#finale').classList.contains('is-open')) renderFinale();
    updateSoundUI();
  }
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // ================================================================ hint / fullscreen / settings
  function toggleHint() {
    state.hint = !state.hint;
    $('#btn-hint').setAttribute('aria-pressed', String(state.hint));
    drawBoard();
  }
  function toggleFullscreen() {
    const d = document;
    if (d.fullscreenElement) d.exitFullscreen().catch(() => {});
    else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(() => {});
  }
  function openSettings() {
    $('#settings').classList.add('is-open');
    $('#settings').setAttribute('aria-hidden', 'false');
    updateSoundUI();
  }
  function closeSettings() {
    $('#settings').classList.remove('is-open');
    $('#settings').setAttribute('aria-hidden', 'true');
  }

  $('#btn-hint').addEventListener('click', toggleHint);
  $('#btn-fullscreen').addEventListener('click', toggleFullscreen);
  $('#btn-settings').addEventListener('click', openSettings);
  $('#btn-close-settings').addEventListener('click', closeSettings);
  $('#settings').addEventListener('click', (e) => { if (e.target.id === 'settings') closeSettings(); });

  document.addEventListener('keydown', (e) => {
    touchActivity();
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (e.key === 'Escape') { closeSettings(); return; }
    if (e.shiftKey && k === 'r') { newGame(false); return; }
    if (e.shiftKey && k === 'd') { demoPlace(); return; }
    if (e.shiftKey) return;
    if (k === 'h') toggleHint();
    else if (k === 'l') setLang(state.lang === 'es' ? 'en' : 'es');
    else if (k === 'f') toggleFullscreen();
  });

  // ================================================================ idle (kiosk) reset
  function touchActivity() { state.lastActivity = Date.now(); }
  ['pointerdown', 'wheel', 'touchstart'].forEach((ev) =>
    window.addEventListener(ev, touchActivity, { passive: true, capture: true }));

  setInterval(() => {
    if (!(CFG.idleResetSeconds > 0)) return;
    if ($('#intro').classList.contains('is-open')) return;
    if ($('#settings').classList.contains('is-open')) return;
    if (drags.size) return;
    if (Date.now() - state.lastActivity > CFG.idleResetSeconds * 1000) newGame(true);
  }, 5000);

  // ================================================================ sound
  const IDB = {
    open() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) { reject(new Error('no indexedDB')); return; }
        const req = indexedDB.open('guernica-puzzle', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('kv');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },
    async run(mode, fn) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const req = fn(db.transaction('kv', mode).objectStore('kv'));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },
    get(k) { return this.run('readonly', (s) => s.get(k)); },
    set(k, v) { return this.run('readwrite', (s) => s.put(v, k)); },
    del(k) { return this.run('readwrite', (s) => s.delete(k)); }
  };

  const Sound = {
    enabled: CFG.soundEnabled,
    volume: CFG.volume,
    customUrl: null,
    customName: null,
    defaultStatus: CFG.completionSound ? 'checking' : 'missing',
    current: null,
    actx: null,

    init() {
      const en = store.get('soundEnabled');
      if (en !== null) this.enabled = en === '1';
      const vol = parseFloat(store.get('volume'));
      if (isFinite(vol)) this.volume = clamp(vol, 0, 1);

      if (CFG.completionSound) {
        const probe = new Audio();
        probe.preload = 'auto';
        probe.addEventListener('canplaythrough', () => { this.defaultStatus = 'ok'; updateSoundUI(); }, { once: true });
        probe.addEventListener('error', () => { this.defaultStatus = 'missing'; updateSoundUI(); }, { once: true });
        probe.src = CFG.completionSound;
      }
      IDB.get('customSound')
        .then((rec) => { if (rec && rec.blob) this.setCustom(rec.blob, rec.name, false); })
        .catch(() => {});
    },

    setCustom(blob, name, persist) {
      if (this.customUrl) URL.revokeObjectURL(this.customUrl);
      this.customUrl = URL.createObjectURL(blob);
      this.customName = name;
      if (persist !== false) IDB.set('customSound', { blob, name }).catch(() => {});
      updateSoundUI();
    },

    clearCustom() {
      if (this.customUrl) URL.revokeObjectURL(this.customUrl);
      this.customUrl = null;
      this.customName = null;
      IDB.del('customSound').catch(() => {});
      updateSoundUI();
    },

    ctx() {
      if (!this.actx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.actx = new AC();
      }
      if (this.actx && this.actx.state === 'suspended') this.actx.resume();
      return this.actx;
    },

    stop() {
      if (this.current) { this.current.pause(); this.current = null; }
    },

    playComplete(force) {
      if (!this.enabled && !force) return;
      this.stop();
      const src = this.customUrl || (this.defaultStatus !== 'missing' ? CFG.completionSound : null);
      if (!src) { this.chime(); return; }
      let fellBack = false;
      const fallback = () => { if (!fellBack) { fellBack = true; this.chime(); } };
      const a = new Audio(src);
      a.volume = this.volume;
      a.addEventListener('error', fallback, { once: true });
      this.current = a;
      const pr = a.play();
      if (pr && pr.catch) pr.catch(fallback);
    },

    // Built-in fallback: a gentle rising arpeggio that settles on a chord.
    chime() {
      const ctx = this.ctx();
      if (!ctx) return;
      const now = ctx.currentTime + 0.05;
      const master = ctx.createGain();
      master.gain.value = 0.22 * this.volume;
      master.connect(ctx.destination);
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
      notes.forEach((f, i) => {
        const start = now + i * 0.14;
        const dur = 2.6 - i * 0.12;
        [['sine', 1], ['triangle', 0.35]].forEach(([type, amt]) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = type;
          o.frequency.value = f;
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(amt, start + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
          o.connect(g).connect(master);
          o.start(start);
          o.stop(start + dur + 0.05);
        });
      });
    },

    // Short "wooden" tap when a piece locks into place.
    click() {
      if (!this.enabled || !CFG.snapSound) return;
      const ctx = this.ctx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(720, now);
      o.frequency.exponentialRampToValueAtTime(260, now + 0.09);
      g.gain.setValueAtTime(0.25 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      o.connect(g).connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.13);
    }
  };

  function updateSoundUI() {
    const src = $('#sound-source');
    if (!src) return;
    if (Sound.customName) src.textContent = `${t('soundCustom')}: ${Sound.customName}`;
    else if (Sound.defaultStatus === 'missing') src.textContent = t('soundChime');
    else src.textContent = `${t('soundDefault')}: ${CFG.completionSound}`;
    $('#btn-clear-sound').disabled = !Sound.customName;
    $('#sound-enabled').checked = Sound.enabled;
    $('#sound-volume').value = Sound.volume;
  }

  $('#btn-choose-sound').addEventListener('click', () => $('#sound-file').click());
  $('#sound-file').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) Sound.setCustom(file, file.name);
    e.target.value = '';
  });
  $('#btn-test-sound').addEventListener('click', () => Sound.playComplete(true));
  $('#btn-clear-sound').addEventListener('click', () => Sound.clearCustom());
  $('#sound-enabled').addEventListener('change', (e) => {
    Sound.enabled = e.target.checked;
    store.set('soundEnabled', Sound.enabled ? '1' : '0');
    if (!Sound.enabled) Sound.stop();
  });
  $('#sound-volume').addEventListener('input', (e) => {
    Sound.volume = clamp(parseFloat(e.target.value) || 0, 0, 1);
    store.set('volume', String(Sound.volume));
    if (Sound.current) Sound.current.volume = Sound.volume;
  });

  // ================================================================ boot
  let resizeRaf = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(layout);
  }).observe(stage);

  setLang(state.lang);
  Sound.init();
  updateStats();

  img.onload = () => newGame(true);
  img.onerror = () => {
    stage.insertAdjacentHTML('beforeend',
      `<p style="position:absolute;inset:auto 0 45% 0;text-align:center;color:#c9c3b4">Image not found: ${esc(CFG.image)}</p>`);
  };
  img.src = CFG.image;
})();
