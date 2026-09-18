// ===================================================================
// SOFT SIGNALS — page/interaction engine
// Same mechanisms as newton-uxbook: paginated "book" stage with
// stagger-in entrance, data-en bilingual swap, springy toggle reveal,
// a lightbox, a CSS-3D circular archive gallery, and a flip credit card.
// ===================================================================
(function(){
  const book = document.getElementById('book');
  const pages = [...document.querySelectorAll('.page')];
  const ids = pages.map(p => p.dataset.page);
  const pills = [...document.querySelectorAll('.pill')];
  const counter = document.getElementById('counter');
  let idx = 0;

  function updateChrome(){
    book.classList.toggle('is-cover', ids[idx] === 'cover');
    pills.forEach(p => p.classList.toggle('active', p.dataset.members.split(',').includes(ids[idx])));
    const act = pills.find(p => p.classList.contains('active'));
    const bar = act && act.parentElement;
    if (act && bar && bar.scrollWidth > bar.clientWidth)
      bar.scrollTo({ left: act.offsetLeft - (bar.clientWidth - act.offsetWidth) / 2, behavior: 'smooth' });
    counter.innerHTML = '<span class="cur">' + idx + '</span><span class="tot"> / ' + (pages.length - 1) + '</span>';
  }

  function staggerIn(page){
    const items = [...page.querySelectorAll('.page-inner > *, .page-inner > .two-col > *, .page-inner > .product-hero > *')];
    items.forEach((el, n) => {
      el.classList.remove('stagger');
      void el.offsetWidth;
      el.style.animationDelay = (n * 45) + 'ms';
      el.classList.add('stagger');
    });
  }

  function resetPage(p){
    p.querySelectorAll('details.toggle').forEach(d => {
      d.open = false;
      const b = d.querySelector(':scope > .toggle-body');
      if (b) { b.style.height = ''; b.style.opacity = ''; b.style.overflow = ''; b.style.transition = ''; }
    });
    p.scrollTo(0, 0);
    p.__reset?.();
  }

  function show(i){
    if (i < 0) i = pages.length - 1;
    else if (i >= pages.length) i = 0;
    if (i === idx) return;
    idx = i;
    resetPage(pages[i]);
    pages.forEach((p, n) => p.classList.toggle('active', n === i));
    updateChrome();
    staggerIn(pages[i]);
  }
  window.__show = show;
  window.__nextIdx = () => (idx + 1) % pages.length;

  document.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.go;
      const i = ids.indexOf(target);
      if (i >= 0) show(i);
    });
  });
  document.getElementById('prevBtn')?.addEventListener('click', () => show(idx - 1));
  document.getElementById('nextBtn')?.addEventListener('click', () => show(idx + 1));
  document.getElementById('prevBtnF')?.addEventListener('click', () => show(idx - 1));
  document.getElementById('nextBtnF')?.addEventListener('click', () => show(idx + 1));

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'Escape') closeLb();
  });

  // wheel navigation on the cover only (elsewhere the page scrolls its own content)
  document.getElementById('coverSlide')?.addEventListener('click', () => show(1));
  document.getElementById('coverSlide')?.addEventListener('wheel', e => { e.preventDefault(); show(1); }, { passive:false });

  // simple swipe between pages on touch, ignoring the archive stage (handles its own drag)
  (function swipeNav(){
    let sx = 0, sy = 0, active = false;
    document.querySelector('.stage').addEventListener('pointerdown', e => {
      if (e.target.closest('.ar-stage, .credit-card, .lightbox, details, a, button')) return;
      sx = e.clientX; sy = e.clientY; active = true;
    });
    document.querySelector('.stage').addEventListener('pointerup', e => {
      if (!active) return;
      active = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) show(idx + (dx < 0 ? 1 : -1));
    });
  })();

  // ---------------- theme + language ----------------
  document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    root.setAttribute('data-theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  let lang = 'ko';
  function setLang(l){
    document.querySelectorAll('[data-en]').forEach(el => {
      if (el._ko === undefined) el._ko = el.innerHTML;
      el.innerHTML = (l === 'en') ? el.getAttribute('data-en') : el._ko;
    });
    document.documentElement.lang = l;
  }
  document.getElementById('langToggle').addEventListener('click', () => {
    lang = lang === 'ko' ? 'en' : 'ko';
    document.getElementById('langLabel').textContent = lang === 'ko' ? 'EN' : 'KO';
    setLang(lang);
  });

  // ---------------- toggle: springy height grow ----------------
  function expandToggle(d, body){
    d.open = true;
    body.style.overflow = 'hidden';
    body.style.height = 'auto';
    const h = body.scrollHeight;
    body.style.height = '0px'; body.style.opacity = '0';
    void body.offsetHeight;
    body.style.transition = 'height .3s cubic-bezier(.22,.61,.36,1), opacity .26s ease';
    body.style.height = h + 'px'; body.style.opacity = '1';
    body.addEventListener('transitionend', function done(e){
      if (e.propertyName !== 'height') return;
      body.style.height = 'auto'; body.style.overflow = ''; body.style.transition = '';
      body.removeEventListener('transitionend', done);
    });
  }
  function collapseToggle(d, body){
    body.style.overflow = 'hidden';
    body.style.height = body.scrollHeight + 'px';
    void body.offsetHeight;
    body.style.transition = 'height .26s cubic-bezier(.22,.61,.36,1), opacity .24s ease';
    body.style.height = '0px'; body.style.opacity = '0';
    body.addEventListener('transitionend', function done(e){
      if (e.propertyName !== 'height') return;
      d.open = false;
      body.style.height = ''; body.style.opacity = ''; body.style.overflow = ''; body.style.transition = '';
      body.removeEventListener('transitionend', done);
    });
  }
  document.querySelectorAll('details.toggle').forEach(d => {
    const sum = d.querySelector(':scope > summary');
    const body = d.querySelector(':scope > .toggle-body');
    if (!sum || !body) return;
    sum.addEventListener('click', e => {
      e.preventDefault();
      d.open ? collapseToggle(d, body) : expandToggle(d, body);
    });
  });

  // ---------------- lightbox ----------------
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbZoom = document.getElementById('lbZoom');
  const lbStage = document.getElementById('lbStage');
  let scale = 1, tx = 0, ty = 0, baseW = 0;
  const MIN = 1, MAX = 6, STEP = 0.3;

  function computeBase(){
    const sw = lbStage.clientWidth * 0.88, sh = lbStage.clientHeight * 0.82;
    const ar = (lbImg.naturalWidth || 1) / (lbImg.naturalHeight || 1);
    let bw = sw, bh = sw / ar;
    if (bh > sh) bw = sh * ar;
    baseW = bw;
  }
  function apply(){
    if (scale <= 1) { tx = 0; ty = 0; }
    lbImg.style.width = (baseW * scale) + 'px';
    lbImg.style.height = 'auto';
    lbImg.style.transform = `translate(${tx}px,${ty}px)`;
    lbZoom.textContent = Math.round(scale * 100) + '%';
  }
  function setScale(s){ scale = Math.min(MAX, Math.max(MIN, s)); apply(); }
  function openLb(src){
    scale = 1; tx = 0; ty = 0;
    lightbox.classList.add('open');
    const ready = () => { computeBase(); apply(); };
    lbImg.src = src;
    if (lbImg.complete && lbImg.naturalWidth) ready();
    else lbImg.onload = ready;
  }
  function closeLb(){ lightbox.classList.remove('open'); }
  window.__openLb = openLb;

  document.addEventListener('click', e => {
    const img = e.target.closest('.process-strip img, figure.full-photo img, .product-hero img');
    if (img) openLb(img.currentSrc || img.src);
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPlus').addEventListener('click', () => setScale(scale + STEP));
  document.getElementById('lbMinus').addEventListener('click', () => setScale(scale - STEP));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  lbStage.addEventListener('wheel', e => { e.preventDefault(); setScale(scale + (e.deltaY < 0 ? STEP : -STEP)); }, { passive:false });

  let dragging = false, sx0 = 0, sy0 = 0;
  lbImg.addEventListener('pointerdown', e => {
    if (scale <= 1) return;
    dragging = true; sx0 = e.clientX - tx; sy0 = e.clientY - ty;
    lbImg.setPointerCapture(e.pointerId);
  });
  lbImg.addEventListener('pointermove', e => { if (dragging) { tx = e.clientX - sx0; ty = e.clientY - sy0; apply(); } });
  lbImg.addEventListener('pointerup', () => dragging = false);

  // ---------------- archive: CSS-3D circular gallery ----------------
  (function(){
    const stage = document.getElementById('arStage');
    if (!stage) return;
    const items = [...stage.querySelectorAll('.ar-item')];
    const page = stage.closest('.archive-page');
    const titleEl = page.querySelector('.ar-title');
    const curEl = page.querySelector('.ar-cur');
    const chips = [...page.querySelectorAll('.ar-chip')];
    let cur = 0, rolling = 0;

    function rollTo(n){
      clearInterval(rolling);
      const L = items.length;
      let d = ((n - cur) % L + L) % L;
      if (d > L / 2) d -= L;
      const steps = Math.abs(d);
      if (!steps) return;
      const dir = Math.sign(d);
      const gap = Math.max(34, Math.round(560 / steps));
      let left = steps;
      rolling = setInterval(() => { go(cur + dir); if (--left <= 0) clearInterval(rolling); }, gap);
    }
    chips.forEach(c => c.addEventListener('click', () => rollTo(+c.dataset.at)));

    const STEP_DEG = 24, R = 44;
    function layout(){
      const w = stage.clientWidth;
      const L = items.length;
      items.forEach((el, i) => {
        let d = i - cur;
        if (d > L / 2) d -= L;
        if (d < -L / 2) d += L;
        const ad = Math.abs(d);
        const prev = el._d; el._d = d;
        const jumped = (prev !== undefined && Math.abs(prev - d) > L / 2) || el.style.visibility === 'hidden';
        if (ad > 4){ el.style.visibility = 'hidden'; return; }
        el.style.visibility = 'visible';
        const ang = d * STEP_DEG;
        const rad = ang * Math.PI / 180;
        const x = Math.sin(rad) * R * w / 100;
        const z = (Math.cos(rad) - 1) * R * w / 100 - ad * 0.16 * w;
        if (jumped) el.style.transition = 'none';
        el.style.setProperty('--dim', ad === 0 ? 0 : ad === 1 ? 0.6 : ad === 2 ? 0.8 : 0.9);
        el.style.zIndex = String(50 - ad);
        el.style.transform = `translate(-50%,-50%) translate3d(${x}px,0,${z}px) rotateY(${-ang}deg) scale(${ad === 0 ? 1 : 0.8})`;
        if (jumped){ void el.offsetWidth; el.style.transition = ''; }
        el.classList.toggle('is-center', ad === 0);
      });
      const c = items[cur];
      if (c){
        curEl.textContent = String(cur + 1);
        const label = c.dataset.group;
        if (titleEl.textContent !== label) titleEl.textContent = label;
        let act = 0;
        chips.forEach((ch, k) => { if (+ch.dataset.at <= cur) act = k; });
        chips.forEach((ch, k) => ch.classList.toggle('on', k === act));
      }
    }
    function go(n){ const L = items.length; cur = ((n % L) + L) % L; layout(); }
    page.__reset = () => { clearInterval(rolling); go(0); };

    let sx = null, dragged = false, downTarget = null;
    stage.addEventListener('pointerdown', e => {
      sx = e.clientX; dragged = false;
      downTarget = e.target.closest('.ar-item');
      stage.setPointerCapture?.(e.pointerId);
      stage.classList.add('dragging');
    });
    stage.addEventListener('pointermove', e => {
      if (sx === null) return;
      const step = stage.clientWidth * 0.05;
      let rest = e.clientX - sx;
      while (Math.abs(rest) > step){
        go(cur - Math.sign(rest));
        sx += Math.sign(rest) * step;
        rest = e.clientX - sx;
        dragged = true;
      }
    });
    stage.addEventListener('pointerup', () => {
      const wasDrag = dragged;
      sx = null; dragged = false; stage.classList.remove('dragging');
      const it = downTarget; downTarget = null;
      if (!it) return;
      const i = items.indexOf(it);
      if (wasDrag) return;
      if (i !== cur){ go(i); return; }
      const img = it.querySelector('img');
      if (img) window.__openLb(img.currentSrc || img.src);
    });
    stage.addEventListener('pointercancel', () => { sx = null; dragged = false; stage.classList.remove('dragging'); });
    stage.addEventListener('wheel', e => { e.preventDefault(); go(cur + (e.deltaY > 0 || e.deltaX > 0 ? 1 : -1)); }, { passive:false });

    layout();
    addEventListener('resize', layout);
  })();

  // ---------------- credits: flip card ----------------
  (function(){
    const card = document.getElementById('creditCard');
    if (!card) return;
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    document.querySelector('.credits-page').__reset = () => card.classList.remove('flipped');
  })();

  updateChrome();
})();
