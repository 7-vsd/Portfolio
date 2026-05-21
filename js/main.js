/* ===========================
   VIPUL DHANGE PORTFOLIO JS
   =========================== */

/* loader.js handles the cinematic intro; it calls window.startHeroAnimations() when done */

/* Fallback: remove loading class after 5s if loader doesn't */
setTimeout(() => {
  if (document.body.classList.contains('loading')) {
    document.body.classList.remove('loading');
    document.body.style.overflow = '';
  }
}, 5000);

/* ── Neural Network Canvas ── */
(function initNeural() {
  const canvas = document.getElementById('neuralCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes, mouse = { x: -9999, y: -9999 };
  const COUNT = window.innerWidth < 768 ? 45 : 80;
  const MAX_DIST = 150;
  const MOUSE_DIST = 200;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    if (!nodes) buildNodes();
  }

  class Node {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.r  = Math.random() * 1.8 + 0.8;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.018 + 0.01;
      this.alpha = Math.random() * 0.2 + 0.15;  // Reduced from 0.4 + 0.3
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += this.speed;
      if (this.x < 0) { this.x = 0; this.vx *= -1; }
      if (this.x > W) { this.x = W; this.vx *= -1; }
      if (this.y < 0) { this.y = 0; this.vy *= -1; }
      if (this.y > H) { this.y = H; this.vy *= -1; }
    }
    draw() {
      const p = Math.sin(this.phase) * 0.25 + 0.75;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * p, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${this.alpha * p})`;
      ctx.fill();

      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5);
      g.addColorStop(0, `rgba(0,212,255,${0.06 * p})`);  // Reduced from 0.15
      g.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  function buildNodes() {
    nodes = Array.from({ length: COUNT }, () => new Node());
  }

  function drawEdges() {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,212,255,${(1 - d/MAX_DIST) * 0.10})`;  // Reduced from 0.22
          ctx.lineWidth = 0.5;  // Reduced from 0.6
          ctx.stroke();
        }
      }
      /* mouse attraction lines */
      const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
      const md  = Math.sqrt(mdx*mdx + mdy*mdy);
      if (md < MOUSE_DIST) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(123,47,255,${(1 - md/MOUSE_DIST) * 0.25})`;  // Reduced from 0.45
        ctx.lineWidth = 0.8;  // Reduced from 1
        ctx.stroke();
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawEdges();
    nodes.forEach(n => { n.update(); n.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  resize();
  loop();
})();

/* ── Hero animations — called by loader.js after exit transition ── */
window.startHeroAnimations = function startHeroAnimations() {
  document.body.style.overflow = '';
  if (typeof Typed !== 'undefined') {
    new Typed('#typedText', {
      strings: [
        'AI Systems',
        'ML Models',
        'Data Science Solutions',
        'Computer Vision',
        'Neural Networks',
        'GenAI Applications',
      ],
      typeSpeed: 55,
      backSpeed: 30,
      backDelay: 1800,
      loop: true,
    });
  }

  /* GSAP hero reveal */
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Set initial states for hero elements
    gsap.set(['.hero-greeting', '.hero-name', '.hero-title', '.hero-bio', '.hero-available', '.hero-actions', '.hero-socials'], { opacity: 0, y: 30 });
    gsap.set('.av-core', { opacity: 0, scale: 0.8 });
    gsap.set('.av-ring', { opacity: 0, scale: 0.9 });
    gsap.set('.av-float', { opacity: 0, scale: 0.8, y: 20 });

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      // Left column animations (faster pace)
      .to('.hero-greeting',     { opacity: 1, y: 0, duration: 0.4 })
      .to('.hero-name',         { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .to('.hero-title',        { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
      .to('.hero-bio',          { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('.hero-available',    { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('.hero-actions',      { opacity: 1, y: 0, duration: 0.4 }, '-=0.1')
      .to('.hero-socials',      { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      // Right column animations (visual section - overlaps more with left)
      .to('.av-core',           { opacity: 1, scale: 1, duration: 0.5 }, '-=0.5')
      .to('.av-ring',           { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }, '-=0.4')
      .to('.av-float.fc1, .av-float.fc3, .av-float.fc4, .av-float.fc6', { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.3')
      .to('.av-float.fc2, .av-float.fc5', {
        opacity: 0.95,
        scale: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.08,
        onComplete: function() {
          document.querySelectorAll('.av-float.fc2, .av-float.fc5').forEach(el => el.classList.add('gsap-animated'));
        }
      }, '-=0.35');
  }

  initCounters();
}

/* ── Skill Bar Animation (handled by GSAP ScrollTrigger below) ── */

/* ── Hero Stat Counters ─────── */
function initCounters() {
  const counters = document.querySelectorAll('.hstat-n');
  counters.forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const duration = 1200;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 16);
  });
}

/* ── Navbar ─────────────────── */
(function initNavbar() {
  const nav  = document.getElementById('navbar');
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  });

  ham.addEventListener('click', () => {
    ham.classList.toggle('active');
    menu.classList.toggle('open');
    document.body.classList.toggle('menu-open');
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      ham.classList.remove('active');
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });

  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    const sections = ['about', 'skills', 'experience', 'projects', 'research', 'certifications', 'contact'];
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) current = id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
})();

/* ── Back to Top ─────────────── */
(function initBackTop() {
  const btn = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── Contact Form ─────────────── */
(function initForm() {
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.fname.value.trim();
    const email   = form.femail.value.trim();
    const subject = form.fsubject.value.trim() || 'Portfolio Contact';
    const message = form.fmessage.value.trim();
    const body    = encodeURIComponent(`Hi Vipul,\n\nMy name is ${name}.\n\n${message}\n\nBest regards,\n${name}\n${email}`);
    const subj    = encodeURIComponent(subject);
    window.location.href = `mailto:dhange.vipul3082@gmail.com?subject=${subj}&body=${body}`;
  });
})();

/* ── Smooth Anchor Scroll ───── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── GSAP ScrollTrigger Animations ── */
(function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  function reveal(targets, vars, triggerEl) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: vars.y || 0, x: vars.x || 0, scale: vars.scale || 1 });
    gsap.to(els, {
      opacity: 1, y: 0, x: 0, scale: 1,
      duration: vars.duration || 0.7,
      stagger: vars.stagger || 0,
      ease: vars.ease || 'power3.out',
      scrollTrigger: {
        trigger: triggerEl || els[0],
        start: vars.start || 'top 85%',
        once: true,
      },
    });
  }

  /* Section headers */
  gsap.utils.toArray('.sec-header').forEach(el => {
    reveal(el, { y: 30, duration: 0.8 }, el);
  });

  /* About columns */
  reveal('.about-visual',   { x: -50, duration: 0.8 }, '.about-grid');
  reveal('.about-text-col', { x:  50, duration: 0.8 }, '.about-grid');

  /* Skill cards */
  reveal('.skill-card', { y: 30, duration: 0.6, stagger: 0.1 }, '.skills-grid');

  /* Skill bars - animate after card reveals */
  gsap.utils.toArray('.skill-card').forEach(card => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        card.querySelectorAll('.bar-fill').forEach(bar => {
          const width = bar.getAttribute('data-w');
          if (width) {
            gsap.to(bar, { width: width + '%', duration: 1.2, ease: 'power3.out', delay: 0.1 });
          }
        });
      }
    });
  });

  /* Timeline cards */
  gsap.utils.toArray('.tl-item').forEach((el, i) => {
    gsap.set(el, { opacity: 0, x: -50 });
    gsap.to(el, {
      opacity: 1, x: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 87%', once: true },
    });
  });

  /* Project cards */
  reveal('.proj-card', { y: 40, duration: 0.7, stagger: 0.12 }, '.proj-grid');

  /* Research card */
  reveal('.research-card', { y: 40, scale: 0.97, duration: 0.8 }, '.research-card');

  /* Cert cards */
  reveal('.cert-card', { y: 30, duration: 0.6, stagger: 0.1 }, '.cert-grid');

  /* Contact */
  reveal('.contact-left', { x: -40, duration: 0.8 }, '.contact-grid');
  reveal('.contact-form', { x:  40, duration: 0.8 }, '.contact-grid');
})();

/* ── About visual rings particle depth ── */
(function initAboutRings() {
  const rings = document.querySelectorAll('.av-ring');
  let tick = 0;
  function anim() {
    tick += 0.002;
    rings.forEach((r, i) => {
      const scale = 1 + Math.sin(tick + i * 1.2) * 0.03;
      r.style.transform = `translate(-50%, -50%) rotate(${tick * (i % 2 ? 1 : -1) * 20}deg) scale(${scale})`;
    });
    requestAnimationFrame(anim);
  }
  anim();
})();
