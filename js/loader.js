/* ================================================
   CINEMATIC AI LOADER — Vipul Dhange Portfolio
   ================================================ */

(function () {
  'use strict';

  /* ── Config ── */
  const PHASES = [
    { pct: 0,   text: 'Initializing AI Systems…' },
    { pct: 15,  text: 'Loading Neural Interface…' },
    { pct: 32,  text: 'Training Portfolio Intelligence…' },
    { pct: 50,  text: 'Rendering AI Environment…' },
    { pct: 68,  text: 'Deploying Interactive Experience…' },
    { pct: 84,  text: 'Calibrating Holographic Systems…' },
    { pct: 100, text: 'AI Experience Ready.' },
  ];

  const TERMINAL_LINES = [
    '<span class="t-green">$ </span><span class="t-dim">python</span> train_model.py',
    '<span class="t-dim">>>> import</span> <span class="t-yellow">tensorflow</span> as tf',
    '<span class="t-dim">>>> model = tf.keras.</span><span class="t-pink">Sequential</span>([',
    '<span class="t-dim">...   Dense(</span><span class="t-yellow">128</span><span class="t-dim">, activation=</span><span class="t-green">\'relu\'</span><span class="t-dim">),</span>',
    '<span class="t-dim">...   Dense(</span><span class="t-yellow">64</span><span class="t-dim">, activation=</span><span class="t-green">\'relu\'</span><span class="t-dim">),</span>',
    '<span class="t-dim">...   Dense(</span><span class="t-yellow">1</span><span class="t-dim">)])</span>',
    '<span class="t-dim">>>> model.fit(X_train, y_train,</span>',
    '<span class="t-dim">...           epochs=</span><span class="t-yellow">100</span>)',
    '<span class="t-green">Epoch 97/100 — acc: 0.923</span>',
    '<span class="t-green">Epoch 98/100 — acc: 0.931</span>',
    '<span class="t-green">Epoch 99/100 — acc: 0.938</span>',
    '<span class="t-pink">✓ Model accuracy: 92.3%</span>',
    '<span class="t-green">$ </span>predict(X_test)',
    '<span class="t-dim">>>> Running inference...</span>',
    '<span class="t-green">✓ Predictions complete.</span>',
  ];

  const DATA_STREAM_CHARS = '01アイウエオABCDEFGHIJKLMNOPQRSTUVWXYZ∇∂∑∫';

  /* ── State ── */
  let progress = 0;
  let phaseIdx = 0;
  let termLineIdx = 0;
  let termLines = [];

  /* ── Elements ── */
  const loader   = document.getElementById('cinematic-loader');
  const fillEl   = document.getElementById('cl-progress-fill');
  const pctEl    = document.getElementById('cl-pct');
  const statusEl = document.getElementById('cl-status');
  const termEl   = document.getElementById('cl-terminal-lines');
  const dsEl     = document.getElementById('cl-data-stream');
  const scene    = document.querySelector('.cl-scene');
  const uiEl     = document.querySelector('.cl-ui');

  if (!loader) return;

  /* ================================================
     MINI NEURAL CANVAS (inside holographic panel)
     ================================================ */

  function initHoloNeural() {
    const c = document.getElementById('holoNeuralCanvas');
    if (!c) return;
    const cx = c.getContext('2d');
    c.width  = c.offsetWidth  || 160;
    c.height = c.offsetHeight || 90;

    const layers = [3, 4, 4, 3];
    const nodePositions = [];

    layers.forEach((count, li) => {
      const xPos = (c.width / (layers.length + 1)) * (li + 1);
      const col  = [];
      for (let ni = 0; ni < count; ni++) {
        const yPos = (c.height / (count + 1)) * (ni + 1);
        col.push({ x: xPos, y: yPos });
      }
      nodePositions.push(col);
    });

    let t = 0;

    function drawHoloNeural() {
      cx.clearRect(0, 0, c.width, c.height);
      t += 0.02;

      /* Connections */
      for (let li = 0; li < nodePositions.length - 1; li++) {
        nodePositions[li].forEach((a, ai) => {
          nodePositions[li + 1].forEach((b, bi) => {
            const wave = Math.sin(t + ai * 0.7 + bi * 0.5 + li * 1.1);
            const alpha = (wave + 1) / 2 * 0.5 + 0.05;
            cx.beginPath();
            cx.moveTo(a.x, a.y);
            cx.lineTo(b.x, b.y);
            cx.strokeStyle = `rgba(0,212,255,${alpha})`;
            cx.lineWidth = 0.8;
            cx.stroke();
          });
        });
      }

      /* Nodes */
      nodePositions.forEach((col, li) => {
        col.forEach((n, ni) => {
          const wave = Math.sin(t + li * 0.8 + ni * 0.6);
          const r    = 3 + wave * 1.2;
          cx.beginPath();
          cx.arc(n.x, n.y, r, 0, Math.PI * 2);
          cx.fillStyle = li === 0 || li === nodePositions.length - 1
            ? `rgba(123,47,255,${0.7 + wave * 0.2})`
            : `rgba(0,212,255,${0.7 + wave * 0.2})`;
          cx.fill();
          cx.shadowBlur = 6;
          cx.shadowColor = '#00d4ff';
          cx.fill();
          cx.shadowBlur = 0;
        });
      });

      requestAnimationFrame(drawHoloNeural);
    }
    drawHoloNeural();
  }

  /* ================================================
     METRIC BARS ANIMATION
     ================================================ */

  function animateMetrics() {
    document.querySelectorAll('.hm-fill').forEach((bar, i) => {
      const target = bar.dataset.w;
      setTimeout(() => { bar.style.width = target; }, 600 + i * 200);
    });
  }

  /* ================================================
     TERMINAL TYPEWRITER
     ================================================ */

  function addTerminalLine() {
    if (!termEl) return;
    const line  = TERMINAL_LINES[termLineIdx % TERMINAL_LINES.length];
    const div   = document.createElement('div');
    div.innerHTML = line;
    termEl.appendChild(div);
    termLineIdx++;

    /* Keep max 7 lines visible */
    while (termEl.children.length > 7) {
      termEl.removeChild(termEl.firstChild);
    }
    termEl.scrollTop = termEl.scrollHeight;
  }

  /* ================================================
     DATA STREAM TICKER
     ================================================ */

  function tickDataStream() {
    if (!dsEl) return;
    let str = '';
    for (let i = 0; i < 60; i++) {
      str += DATA_STREAM_CHARS[Math.floor(Math.random() * DATA_STREAM_CHARS.length)];
    }
    dsEl.textContent = str;
  }

  /* ================================================
     LOADING PROGRESS
     ================================================ */

  function updateProgress(p) {
    progress = Math.min(100, p);
    if (fillEl) fillEl.style.width = progress + '%';
    if (pctEl)  pctEl.textContent  = Math.floor(progress) + '%';

    /* Phase text */
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (progress >= PHASES[i].pct) {
        if (phaseIdx !== i && statusEl) {
          phaseIdx = i;
          statusEl.style.opacity = 0;
          setTimeout(() => {
            if (statusEl) statusEl.textContent = PHASES[i].text;
            statusEl.style.opacity = 1;
          }, 150);
        }
        break;
      }
    }
  }

  /* ================================================
     SCENE ENTRANCE
     ================================================ */

  function revealScene() {
    if (typeof gsap === 'undefined') {
      if (scene) { scene.style.opacity = 1; scene.style.transform = 'none'; }
      if (uiEl)  { uiEl.style.opacity  = 1; }
      return;
    }

    const tl = gsap.timeline();
    tl.to(scene, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
      .to(uiEl,  { opacity: 1,       duration: 0.8, ease: 'power2.out' }, '-=0.5');
  }

  /* ================================================
     EXIT TRANSITION → REVEAL PORTFOLIO
     ================================================ */

  function startExitTransition() {
    if (typeof gsap === 'undefined') {
      /* Fallback: simple fade out */
      loader.style.transition = 'opacity 0.8s ease';
      loader.style.opacity = '0';
      setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.style.overflow = '';
        loader.style.display = 'none';
        if (window.startHeroAnimations) window.startHeroAnimations();
      }, 800);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        /* Remove loading class to show main content */
        document.body.classList.remove('loading');
        document.body.style.overflow = '';
        loader.style.display = 'none';
        if (window.startHeroAnimations) window.startHeroAnimations();
      }
    });

    /* 1. Flash status to "AI Experience Ready." (already set) */
    /* 2. Scatter holograms outward */
    tl.to('.cl-holo-left',  { x: -300, opacity: 0, duration: 0.7, ease: 'power3.in' }, 0)
      .to('.cl-holo-right', { x:  300, opacity: 0, duration: 0.7, ease: 'power3.in' }, 0)
      /* 3. Bot ascends and dissolves */
      .to('.cl-bot',        { y: -60, scale: 1.2, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.1)
      /* 4. Desk scales up / dissolves */
      .to('.cl-desk',       { scale: 1.15, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.15)
      /* 5. Rings explode outward */
      .to('.cl-ring',       { scale: 3, opacity: 0, duration: 0.8, ease: 'power2.in' }, 0)
      /* 6. Grid fades */
      .to('.cl-grid',       { opacity: 0, duration: 0.4 }, 0.3)
      /* 7. Scan line & corners */
      .to(['.cl-scanline', '.cl-corner', '.cl-hud-tag'], { opacity: 0, duration: 0.3 }, 0.2)
      /* 8. Loading UI slides down */
      .to('.cl-ui',         { y: 80, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.2)
      /* 9. Fade out dark overlay to reveal neural network */
      .to('.cl-dark-overlay', { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.3)
      /* 10. Transition overlay pulse */
      .to('.cl-transition-overlay', { opacity: 1, duration: 0.3 }, 0.4)
      .to('.cl-transition-overlay', { opacity: 0, duration: 0.5 }, 0.7)
      /* 11. Full loader fades with slight zoom */
      .to(loader,           { opacity: 0, scale: 1.04, duration: 0.9, ease: 'power2.inOut' }, 0.5);
  }

  /* ================================================
     ORCHESTRATE
     ================================================ */

  function init() {

    /* Reveal scene after 500ms */
    setTimeout(revealScene, 500);

    /* Start terminal typing */
    addTerminalLine();
    const termTimer = setInterval(addTerminalLine, 600);

    /* Data stream ticker */
    const dsTimer = setInterval(tickDataStream, 120);

    /* Animate metric bars */
    setTimeout(animateMetrics, 900);

    /* Init mini holographic neural canvas */
    setTimeout(initHoloNeural, 600);

    /* Progress animation - minimum 2 seconds total */
    let p = 0;
    const startTime = Date.now();
    const minDuration = 2000; // Minimum 2 seconds

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // Slow down progress to ensure minimum 2 seconds
      if (elapsed < minDuration * 0.8) {
        p += Math.random() * 4 + 2; // Slower increment
      } else {
        p += Math.random() * 8 + 6; // Speed up near the end
      }

      updateProgress(p);

      if (p >= 100 && elapsed >= minDuration) {
        clearInterval(progressTimer);
        clearInterval(termTimer);
        clearInterval(dsTimer);
        updateProgress(100);

        setTimeout(() => {
          startExitTransition();
        }, 500);
      }
    }, 70);
  }

  /* Run once DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
