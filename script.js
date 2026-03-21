/* ===========================
   DEGEN MONK — script.js
   =========================== */

'use strict';

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── 1. MATRIX RAIN ──────────────────────────────────────────────────────────

(function initMatrixRain() {
  if (REDUCE_MOTION) return;
  const canvas = document.getElementById('matrix-rain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CHARS = '₿ΞΩψ∞☯◈฿✦龍禅道卍ム工ヲソノハユキ01';
  const charArr = CHARS.split('').filter(c => c.trim());

  let columns = [];
  const FONT_SIZE = 16;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const colCount = Math.floor(canvas.width / FONT_SIZE);
    columns = Array.from({ length: colCount }, () => ({
      y:     Math.random() * canvas.height,
      speed: 0.5 + Math.random() * 1.5,
    }));
  }

  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px "Share Tech Mono", monospace`;

    columns.forEach((col, i) => {
      const char = charArr[Math.floor(Math.random() * charArr.length)];
      const x = i * FONT_SIZE;

      // Leading character is bright
      ctx.fillStyle = '#ffffff';
      ctx.fillText(char, x, col.y);

      // Trail characters in green
      ctx.fillStyle = '#39ff14';
      const trailChar = charArr[Math.floor(Math.random() * charArr.length)];
      ctx.fillText(trailChar, x, col.y - FONT_SIZE);

      col.y += col.speed * FONT_SIZE;
      if (col.y > canvas.height + FONT_SIZE * 5) {
        col.y = -FONT_SIZE * Math.random() * 10;
        col.speed = 0.5 + Math.random() * 1.5;
      }
    });
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 50);
})();


// ── 2. FLOATING PARTICLES ───────────────────────────────────────────────────

(function initParticles() {
  if (REDUCE_MOTION) return;
  const container = document.getElementById('particles');
  if (!container) return;

  const SYMBOLS = ['✦', '◈', '☯', '✧', '⬡', '◆', '❋', '✿'];

  function spawnParticle() {
    const el = document.createElement('div');
    el.className = 'particle';
    el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    const size    = 8 + Math.random() * 14;
    const left    = Math.random() * 100;
    const duration = 6 + Math.random() * 10;
    const drift   = (Math.random() - 0.5) * 120;
    const hue     = Math.random() > 0.5 ? '#9d4edd' : '#ffd700';

    el.style.cssText = `
      left: ${left}%;
      font-size: ${size}px;
      color: ${hue};
      --drift: ${drift}px;
      animation-duration: ${duration}s;
      animation-delay: ${Math.random() * 3}s;
      filter: drop-shadow(0 0 4px ${hue});
      text-shadow: 0 0 8px ${hue};
    `;

    container.appendChild(el);
    setTimeout(() => el.remove(), (duration + 3) * 1000);
  }

  // Spawn regularly
  setInterval(spawnParticle, 800);
  // Initial burst
  for (let i = 0; i < 8; i++) setTimeout(spawnParticle, i * 200);
})();


// ── 3. HERO SUBTITLE ROTATOR ────────────────────────────────────────────────

(function initSubtitleRotator() {
  const el = document.getElementById('hero-subtitle');
  if (!el) return;

  const lines = [
    '☯  ENLIGHTENED SPECULATION  ☯',
    '₿  DIAMOND HANDS, EMPTY MIND  ₿',
    '∞  THE CHART IS AN ILLUSION  ∞',
    '龍  BUY THE DIP. BREATHE.  龍',
    '✦  NFA. NOT FINANCIAL ASCETICISM.  ✦',
    '禅  THE VOID HOLDS YOUR BAGS  禅',
    '◈  NGMI IS A STATE OF MIND  ◈',
    'Ω  WAGMI OR WAGNI — ALL IMPERMANENT  Ω',
  ];

  let idx = 0;

  function rotate() {
    el.classList.add('fade-out');
    setTimeout(() => {
      idx = (idx + 1) % lines.length;
      el.textContent = lines[idx];
      el.classList.remove('fade-out');
    }, 500);
  }

  el.textContent = lines[0];
  setInterval(rotate, 3500);
})();


// ── 4. DAILY SCROLL LOADER ──────────────────────────────────────────────────

const FALLBACK = {
  date:    null,
  title:   'The Scroll Awaits...',
  content: 'The monk is preparing today\'s wisdom.\n\nReturn when the candles are lit and the charts have spoken.',
  mantra:  'Patience is the only alpha.',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function typewriterEffect(elementId, text, speedMs = 28) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.textContent = '';

  // Add cursor span
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  el.appendChild(cursor);

  const chars = [...text]; // Unicode-safe split
  let i = 0;

  const interval = setInterval(() => {
    if (i >= chars.length) {
      clearInterval(interval);
      cursor.remove();
      return;
    }
    cursor.before(document.createTextNode(chars[i]));
    i++;
  }, speedMs);
}

async function loadScroll(url) {
  const titleEl   = document.getElementById('scroll-title');
  const dateBadge = document.getElementById('date-badge');
  const mantraEl  = document.getElementById('mantra');
  const contentEl = document.getElementById('scroll-content');

  if (contentEl) {
    contentEl.innerHTML = '<span class="scroll-loading"><span class="loading-dots">Loading scroll</span></span>';
  }

  let data = FALLBACK;

  try {
    const res = await fetch(url + '?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (json && json.content) data = json;
  } catch (err) {
    console.warn('[degen-monk] Could not load scroll:', url, err);
  }

  if (dateBadge) dateBadge.textContent = formatDate(data.date);
  if (titleEl)   titleEl.textContent   = data.title  || FALLBACK.title;
  if (mantraEl)  mantraEl.textContent  = data.mantra || FALLBACK.mantra;

  if (contentEl) {
    contentEl.textContent = '';
    typewriterEffect('scroll-content', data.content || FALLBACK.content);
  }
}

function loadScrollForHash(hash) {
  const todayLink    = document.getElementById('today-link');
  const sectionLabel = document.querySelector('#daily-scroll .section-label');

  if (hash && hash.length > 1) {
    loadScroll('./' + hash.slice(1) + '.json');
    if (todayLink)    todayLink.removeAttribute('hidden');
    if (sectionLabel) sectionLabel.textContent = 'Past Transmission';
  } else {
    loadScroll('./daily.json');
    if (todayLink)    todayLink.setAttribute('hidden', '');
    if (sectionLabel) sectionLabel.textContent = 'Daily Transmission';
  }
}


// ── 5. CAST CAROUSEL ────────────────────────────────────────────────────────

(function initCarousel() {
  const track    = document.getElementById('carousel-track');
  const prevBtn  = document.getElementById('carousel-prev');
  const nextBtn  = document.getElementById('carousel-next');
  const dotsEl   = document.getElementById('carousel-dots');
  if (!track || !prevBtn || !nextBtn || !dotsEl) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const dots   = Array.from(dotsEl.querySelectorAll('.carousel-dot'));
  const TOTAL  = slides.length;
  const DELAY  = 7000; // ms per slide

  let current   = 0;
  let timer     = null;
  let progress  = null;

  // Inject progress bar
  const bar = document.createElement('div');
  bar.className = 'carousel-progress';
  track.closest('.carousel-wrapper').appendChild(bar);
  progress = bar;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('carousel-dot--active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (idx + TOTAL) % TOTAL;

    slides[current].classList.add('active');
    dots[current].classList.add('carousel-dot--active');
    dots[current].setAttribute('aria-selected', 'true');

    resetProgress();
  }

  function resetProgress() {
    progress.style.transition = 'none';
    progress.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progress.style.transition = `width ${DELAY}ms linear`;
        progress.style.width = '100%';
      });
    });
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), DELAY);
    resetProgress();
  }

  function stopTimer() {
    clearInterval(timer);
    progress.style.transition = 'none';
  }

  // Init first slide
  slides[0].classList.add('active');
  startTimer();

  // Arrow buttons
  prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });

  // Dot buttons
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startTimer(); });
  });

  // Pause on hover
  const wrapper = track.closest('.carousel-wrapper');
  wrapper.addEventListener('mouseenter', stopTimer);
  wrapper.addEventListener('mouseleave', startTimer);

  // Keyboard support
  wrapper.setAttribute('tabindex', '0');
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startTimer(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startTimer(); }
  });

  // Touch/swipe support
  let touchStartX = 0;
  wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
      startTimer();
    }
  });
})();


// ── 6. ARCHIVE LOADER ───────────────────────────────────────────────────────

(function initArchive() {
  const listEl = document.getElementById('archive-list');

  async function renderArchive() {
    if (!listEl) return;
    let entries = [];
    try {
      const res = await fetch('./archive.json?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      entries = await res.json();
    } catch (err) {
      console.warn('[degen-monk] Could not load archive.json', err);
      listEl.innerHTML = '<p class="archive-empty">No past transmissions found.</p>';
      return;
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      listEl.innerHTML = '<p class="archive-empty">No past transmissions yet.</p>';
      return;
    }
    listEl.innerHTML = '';
    entries.forEach(entry => {
      const btn = document.createElement('button');
      btn.className = 'archive-entry';
      btn.setAttribute('data-date', entry.date);
      btn.setAttribute('aria-label', 'Load transmission: ' + entry.title);
      btn.innerHTML =
        '<span class="archive-entry-date">' + entry.date + '</span>' +
        '<span class="archive-entry-title">' + entry.title + '</span>';
      btn.addEventListener('click', () => { window.location.hash = entry.date; });
      listEl.appendChild(btn);
    });
    highlightActiveEntry(window.location.hash);
  }

  function highlightActiveEntry(hash) {
    if (!listEl) return;
    const cur = hash && hash.length > 1 ? hash.slice(1) : null;
    listEl.querySelectorAll('.archive-entry').forEach(btn => {
      const active = btn.getAttribute('data-date') === cur;
      btn.classList.toggle('archive-entry--active', active);
      active ? btn.setAttribute('aria-current', 'true') : btn.removeAttribute('aria-current');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderArchive();
    loadScrollForHash(window.location.hash);

    const todayLink = document.getElementById('today-link');
    if (todayLink) {
      todayLink.addEventListener('click', e => {
        e.preventDefault();
        window.location.hash = '';
        loadScrollForHash('');
        highlightActiveEntry('');
      });
    }

    window.addEventListener('hashchange', () => {
      loadScrollForHash(window.location.hash);
      highlightActiveEntry(window.location.hash);
      document.getElementById('daily-scroll')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ===========================
   COMIC STRIP LOADER
   =========================== */
(function () {
  let stripsData = null;

  async function getStrips() {
    if (stripsData) return stripsData;
    try {
      const res = await fetch('strips.json?t=' + Date.now());
      stripsData = await res.json();
    } catch (e) { stripsData = {}; }
    return stripsData;
  }

  async function showStrip(date) {
    if (!date) return;
    const strips  = await getStrips();
    const section = document.getElementById('strip-section');
    const img     = document.getElementById('strip-image');
    const titleEl = document.getElementById('strip-title');
    if (!section) return;

    const entry = strips[date];
    if (entry) {
      img.src             = entry.file + '?t=' + Date.now();
      img.alt             = 'DegenMonk — ' + entry.title;
      titleEl.textContent = entry.title;
      section.removeAttribute('hidden');
      section.style.display = '';
    } else {
      section.setAttribute('hidden', '');
      section.style.display = 'none';
    }
  }

  async function loadDateAndShow() {
    const hash = window.location.hash.replace('#', '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(hash)) {
      showStrip(hash);
    } else {
      // Default: fetch daily.json and use its date
      try {
        const res  = await fetch('daily.json?t=' + Date.now());
        const json = await res.json();
        showStrip(json.date);
      } catch (e) {}
    }
  }

  // On page load
  document.addEventListener('DOMContentLoaded', loadDateAndShow);

  // On archive navigation (hash changes)
  window.addEventListener('hashchange', loadDateAndShow);
})();
