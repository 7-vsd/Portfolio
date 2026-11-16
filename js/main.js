/* Vipul Dhange portfolio v2: character scene, scroll story, data visuals */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var animate = typeof window.gsap !== "undefined" && !reduce;
  var desktop = window.matchMedia("(min-width: 901px)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (animate) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- helpers ---------------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function smoothPath(p) {
    var d = "M" + p[0][0].toFixed(1) + "," + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += " C" + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + "," + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + " " +
        (c[0] - (e[0] - b[0]) / 6).toFixed(1) + "," + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + " " + c[0].toFixed(1) + "," + c[1].toFixed(1);
    }
    return d;
  }
  function dash(path) { var l = path.getTotalLength(); path.style.strokeDasharray = l; path.style.strokeDashoffset = l; return l; }

  // split text into characters (hero name) or words (titles)
  function splitChars(node) {
    var t = node.textContent; node.textContent = "";
    t.split("").forEach(function (c) { var s = document.createElement("span"); s.className = "ch"; s.textContent = c; node.appendChild(s); });
    return $$(".ch", node);
  }
  function splitWords(node) {
    var words = node.textContent.trim().split(/\s+/); node.textContent = "";
    var inner = [];
    words.forEach(function (w, i) {
      var o = document.createElement("span"); o.className = "word";
      var n = document.createElement("span"); n.className = "ch"; n.textContent = w;
      o.appendChild(n); node.appendChild(o); inner.push(n);
      if (i < words.length - 1) node.appendChild(document.createTextNode(" "));
    });
    return inner;
  }

  /* ---------------- smooth scroll ---------------- */
  var lenis = null;
  if (animate && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href"); if (id.length < 2) return;
      var target = $(id); if (!target) return;
      e.preventDefault();
      // the hero is pinned while it zooms, so jump past the zoom for #about
      var y = id === "#top" ? 0 : target.getBoundingClientRect().top + window.scrollY - 70;
      if (lenis) lenis.scrollTo(y, { duration: 1.4 }); else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------------- nav ---------------- */
  var nav = $("#nav"), prog = $(".nav__progress"), lastY = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    nav.classList.toggle("is-hidden", y > lastY + 2 && y > 500);
    if (y < lastY - 2) nav.classList.remove("is-hidden");
    lastY = y;
  }, { passive: true });
  nav.addEventListener("focusin", function () { nav.classList.remove("is-hidden"); });
  var navLinks = $$(".nav__links a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) navLinks.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + x.target.id); }); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (l) { var s = $(l.getAttribute("href")); if (s) io.observe(s); });
  }

  /* ---------------- light / dark theme ---------------- */
  var themeBtn = $("#themeToggle"), metaTheme = $('meta[name="theme-color"]');
  function applyTheme(light, animateIt) {
    var root = document.documentElement;
    if (light) root.setAttribute("data-theme", "light"); else root.removeAttribute("data-theme");
    themeBtn.innerHTML = light ? '<i class="fa-solid fa-moon" aria-hidden="true"></i>' : '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
    themeBtn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    if (metaTheme) metaTheme.setAttribute("content", light ? "#EEF2F7" : "#0D1530");
    if (animateIt && animate) {
      gsap.fromTo(themeBtn.firstChild, { rotation: -90, scale: .4 }, { rotation: 0, scale: 1, duration: .5, ease: "back.out(2.5)" });
      gsap.fromTo(".moon", { scale: .3, transformOrigin: "50% 50%" }, { scale: 1, duration: .8, ease: "back.out(2)" });
    }
  }
  applyTheme(document.documentElement.getAttribute("data-theme") === "light", false);
  themeBtn.addEventListener("click", function () {
    var light = document.documentElement.getAttribute("data-theme") !== "light";
    applyTheme(light, true);
    try { localStorage.setItem("vd-theme", light ? "light" : "dark"); } catch (e) {}
  });

  /* ---------------- cursor + magnetic buttons ---------------- */
  if (animate && finePointer) {
    var cur = $(".cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring");
    var dx = gsap.quickTo(dot, "x", { duration: .1 }), dy = gsap.quickTo(dot, "y", { duration: .1 });
    var rx = gsap.quickTo(ring, "x", { duration: .45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: .45, ease: "power3" });
    window.addEventListener("pointermove", function (e) { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener("pointerover", function (e) { cur.classList.toggle("is-link", !!e.target.closest("a, button")); });

    $$(".magnetic").forEach(function (m) {
      var mx = gsap.quickTo(m, "x", { duration: .5, ease: "elastic.out(1, .4)" }), my = gsap.quickTo(m, "y", { duration: .5, ease: "elastic.out(1, .4)" });
      m.addEventListener("pointermove", function (e) { var r = m.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .3); my((e.clientY - r.top - r.height / 2) * .4); });
      m.addEventListener("pointerleave", function () { mx(0); my(0); });
    });
  }

  /* =====================================================
     THE SCENE: build the screens' contents
     ===================================================== */
  var R = rng(5);
  var sbars = $("#sbars"), bars = [];
  for (var b = 0; b < 8; b++) {
    var h = 30 + R() * 70;
    var br = el("rect", { x: 612 + b * 19, y: 398 - h, width: 12, height: h, rx: 2, fill: b > 5 ? "#4CC9F0" : "#3A4880" }, sbars);
    br.dataset.h = h; bars.push(br);
  }
  el("line", { x1: 610, x2: 920, y1: 398, y2: 398, stroke: "#24305E" }, sbars);
  var sline = $("#sline"), sfc = $("#sfc");
  function linePts() {
    var p = [];
    for (var i = 0; i < 7; i++) p.push([772 + i * 16, 380 - i * 12 - R() * 26]);
    return p;
  }
  function setLine(p) {
    sline.setAttribute("d", smoothPath(p));
    var last = p[p.length - 1];
    sfc.setAttribute("d", smoothPath([last, [last[0] + 22, last[1] - 14], [last[0] + 46, last[1] - 30]]));
  }
  setLine(linePts());

  var codeLines = [
    ["#4CC9F0", "import pandas as pd"], ["#9AA6C7", "df = pd.read_sql(q)"], ["#F5A524", "df.dropna(inplace=True)"],
    ["#9AA6C7", "X, y = split(df)"], ["#4CC9F0", "model.fit(X, y)"], ["#4ADE80", "# R2 looks good"], ["#F5A524", "agent.run(inbox)"],
    ["#9AA6C7", "plot(forecast)"], ["#4CC9F0", "push_to_powerbi()"]
  ];
  var code = $("#code"), codeEls = codeLines.map(function (c, i) {
    var t = el("text", { x: 976, y: 262 + i * 14, fill: c[0], class: "s-code" }, code); t.textContent = c[1]; return t;
  });

  /* =====================================================
     THE SCENE: idle life (typing, blinking, steam...)
     ===================================================== */
  function sceneLife() {
    gsap.to("#foreNear", { rotation: -4, svgOrigin: "396 430", duration: .11, yoyo: true, repeat: -1, ease: "sine.inOut", repeatDelay: .02 });
    gsap.to("#foreFar", { rotation: 4, svgOrigin: "408 424", duration: .13, yoyo: true, repeat: -1, ease: "sine.inOut", delay: .06 });
    gsap.to("#head", { rotation: 2, svgOrigin: "330 290", duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to("#eye", { scaleY: .1, svgOrigin: "362 236", duration: .08, yoyo: true, repeat: -1, repeatDelay: 3.2, ease: "none" });
    $$("#steam path").forEach(function (p, i) {
      gsap.fromTo(p, { y: 8, opacity: 0 }, { y: -18, opacity: .7, duration: 2.2, repeat: -1, delay: i * 1.1, ease: "sine.out", yoyo: false });
    });
    gsap.to("#leaves path", { rotation: function (i) { return i % 2 ? 4 : -4; }, svgOrigin: "1137 430", duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .4 });
    gsap.to("#cityLights rect", { opacity: .25, duration: .8, yoyo: true, repeat: -1, stagger: { each: .45, from: "random", repeat: -1, yoyo: true } });
    gsap.to("#lightCone", { opacity: .85, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
    $$(".chip").forEach(function (c, i) { gsap.to(c, { y: i % 2 ? 10 : -10, duration: 2.4 + i * .4, yoyo: true, repeat: -1, ease: "sine.inOut" }); });

    // the dashboard on his screen keeps updating
    var kpis = [["₹4.2M", "+12.4%", "3.1%"], ["₹4.5M", "+14.0%", "2.8%"], ["₹4.9M", "+15.2%", "2.6%"]], k = 0;
    gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
      .add(function () {
        bars.forEach(function (r) { var h = 30 + Math.random() * 70; gsap.to(r, { attr: { y: 398 - h, height: h }, duration: .8, ease: "power3.out" }); });
        setLine(linePts()); var l = dash(sline); gsap.to(sline, { strokeDashoffset: 0, duration: 1, ease: "power2.out" });
        k = (k + 1) % kpis.length; ["#kpi1", "#kpi2", "#kpi3"].forEach(function (id, i) { $(id).textContent = kpis[k][i]; });
        gsap.fromTo(".kpi", { opacity: .4 }, { opacity: 1, duration: .5, stagger: .1 });
      }).to({}, { duration: 1.6 });

    // code types out line by line, then clears
    gsap.timeline({ repeat: -1, repeatDelay: 1 })
      .set(codeEls, { opacity: 0 })
      .to(codeEls, { opacity: 1, duration: .05, stagger: .38 })
      .to({}, { duration: 1.5 });
  }

  /* =====================================================
     HERO + STORY INTRO
     ===================================================== */
  var heroChars = [];
  $$("[data-hero-split]").forEach(function (n) { heroChars = heroChars.concat(splitChars(n)); });
  var store = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  var playIntro = animate && !store.get("vd-intro-seen");

  // Short entrance for the hero text (used after the story intro)
  function heroText() {
    gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: sceneLife })
      .to(heroChars, { yPercent: 0, rotate: 0, duration: 1, stagger: .035, ease: "expo.out" })
      .to("[data-hero]", { opacity: 1, y: 0, duration: .8, stagger: .1 }, .2)
      .fromTo(".chip", { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .6, stagger: .12, ease: "back.out(2)" }, .6);
  }

  // Full hero build (used when the intro was already seen this visit)
  function heroFull() {
    gsap.set(["#window", "#chair", "#desk", "#monitor", "#monitor2", "#mug", "#plant", "#laptop"], { opacity: 0 });
    gsap.set("#lamp", { y: -160 });
    gsap.set("#man", { opacity: 0, x: -60 });
    gsap.set("#screen", { fill: "#000" });
    gsap.set("#screenUI", { opacity: 0 });
    gsap.set(".chip", { opacity: 0, scale: .6 });
    gsap.timeline({ defaults: { ease: "power3.out" }, delay: .1, onComplete: sceneLife })
      .to(heroChars, { yPercent: 0, rotate: 0, duration: 1, stagger: .035, ease: "expo.out" }, .1)
      .to("[data-hero]", { opacity: 1, y: 0, duration: .8, stagger: .1 }, .4)
      .to("#window", { opacity: 1, duration: .8 }, .2)
      .to("#lamp", { y: 0, duration: 1.1, ease: "bounce.out" }, .3)
      .fromTo("#desk", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8 }, .45)
      .fromTo("#chair", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: .7 }, .6)
      .fromTo(["#monitor", "#monitor2", "#laptop"], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .8, stagger: .12 }, .65)
      .fromTo(["#mug", "#plant"], { opacity: 0, scale: .6, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: .6, stagger: .1, ease: "back.out(2)" }, .85)
      .to("#man", { opacity: 1, x: 0, duration: 1, ease: "power4.out" }, .9)
      .to("#screen", { fill: "#E8ECF7", duration: .08 }, 1.5)
      .to("#screen", { fill: "#0D1530", duration: .35 }, 1.58)
      .to("#screenUI", { opacity: 1, duration: .4 }, 1.7)
      .fromTo(bars, { attr: { height: 0, y: 398 } }, { attr: { height: function (i, t) { return +t.dataset.h; }, y: function (i, t) { return 398 - t.dataset.h; } }, duration: .7, stagger: .05 }, 1.8)
      .to(".chip", { opacity: 1, scale: 1, duration: .6, stagger: .15, ease: "back.out(2)" }, 2);
  }

  // copy the hero scene and prefix every id, so several copies can live on the page
  var heroScene = $("#scene");
  function sceneCopy(prefix) {
    var svg = heroScene.cloneNode(true);
    svg.removeAttribute("id"); svg.removeAttribute("role"); svg.removeAttribute("aria-label");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", prefix + "-svg");
    $$("[id]", svg).forEach(function (n) { n.id = prefix + "-" + n.id; });
    $$("*", svg).forEach(function (n) {
      ["fill", "stroke", "clip-path"].forEach(function (a) { var v = n.getAttribute(a); if (v && v.indexOf("url(#") === 0) n.setAttribute(a, v.replace("url(#", "url(#" + prefix + "-")); });
    });
    return svg;
  }
  var contactSvg = sceneCopy("c"); // taken now, before any animation touches the hero

  function storyIntro(done) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    var svg = sceneCopy("i");
    if (innerWidth < innerHeight) svg.setAttribute("viewBox", "220 30 840 760");
    function I(id) { return svg.querySelector("#i-" + id); }

    var ov = document.createElement("div");
    ov.className = "intro";
    ov.innerHTML = '<div class="intro__stage"></div><button class="intro__skip" type="button">Skip intro</button>';
    $(".intro__stage", ov).appendChild(svg);
    document.body.appendChild(ov);
    document.body.classList.add("intro-on");
    if (lenis) lenis.stop();

    var room = ["window", "chair", "desk", "monitor", "monitor2", "laptop", "mug", "plant"].map(I);
    I("bagFloor").style.display = "none"; // the bag only belongs to the contact scene
    var stand = I("stand"), walker = I("walker"), bubble = I("bubble"), man = I("man");
    var b1 = I("b1"), b2 = I("b2"), mouthO = I("mouthO");
    var legs = [I("wLegN"), I("wLegF")], arms = [I("wArmN"), I("wArmF")];

    gsap.set(room, { opacity: 0 });
    gsap.set(I("lamp"), { y: -220, opacity: 0 });
    gsap.set([man, walker], { opacity: 0 });
    gsap.set(stand, { opacity: 0 });
    gsap.set(bubble, { scale: 0, transformOrigin: "0% 100%" });
    gsap.set(I("lapLid"), { rotation: 0, svgOrigin: "594 456" });
    gsap.set(I("lapScreen"), { fill: "#1A2036" });
    gsap.set(I("lapGlow"), { opacity: 0 });
    gsap.set(I("screen"), { fill: "#05080F" });
    gsap.set(I("screenUI"), { opacity: 0 });
    gsap.set(walker, { x: 620, y: 468, scaleX: 0, transformOrigin: "50% 50%" });
    gsap.set(legs.concat(arms), { transformOrigin: "50% 0%" });

    function type(node, text, dur) {
      var chars = Array.from(text), o = { n: 0 };
      return gsap.to(o, { n: chars.length, duration: dur, ease: "none", onUpdate: function () { node.textContent = chars.slice(0, Math.round(o.n)).join(""); } });
    }

    var finished = false;
    function finish() {
      if (finished) return; finished = true;
      ov.remove();
      document.body.classList.remove("intro-on");
      if (lenis) lenis.start();
      store.set("vd-intro-seen", "1");
      ScrollTrigger.refresh();
      done();
    }
    function reveal(fast) {
      var r = I("lapScreen").getBoundingClientRect();
      var x = r.width ? r.left + r.width / 2 : innerWidth / 2, y = r.height ? r.top + r.height / 2 : innerHeight / 2;
      ov.style.setProperty("--rx", x + "px"); ov.style.setProperty("--ry", y + "px");
      var far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var o = { r: 0 };
      gsap.to(".intro__skip", { opacity: 0, duration: .2 });
      gsap.to(o, { r: far + 20, duration: fast ? .6 : 1.2, ease: "power2.in", onUpdate: function () { ov.style.setProperty("--r", o.r + "px"); }, onComplete: finish });
    }

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl
      // 1. the boy appears first
      .fromTo(stand, { opacity: 0, scale: .4, y: 60, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, y: 0, duration: .8, ease: "back.out(1.7)" }, .2)
      // 2. the room builds itself around him while he looks around
      .to(I("standHead"), { rotation: -9, svgOrigin: "620 250", duration: .4, ease: "sine.inOut" }, 1.1)
      .to(I("window"), { opacity: 1, duration: .7 }, 1.0)
      .to(I("lamp"), { y: 0, opacity: 1, duration: 1, ease: "bounce.out" }, 1.1)
      .fromTo(I("desk"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .7 }, 1.3)
      .to(I("standHead"), { rotation: 9, svgOrigin: "620 250", duration: .5, ease: "sine.inOut" }, 1.6)
      .fromTo(I("chair"), { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: .6 }, 1.45)
      .fromTo([I("monitor"), I("monitor2"), I("laptop")], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6, stagger: .12 }, 1.55)
      .fromTo([I("mug"), I("plant")], { opacity: 0, scale: .4, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: .5, stagger: .1, ease: "back.out(2)" }, 1.85)
      .to(I("standHead"), { rotation: 0, svgOrigin: "620 250", duration: .4, ease: "sine.inOut" }, 2.2)
      // 3. he waves and says hi
      .to(I("standArmR"), { rotation: -145, transformOrigin: "0% 0%", duration: .55, ease: "back.out(1.6)" }, 2.5)
      .fromTo(I("standForeR"), { rotation: 0 }, { rotation: -28, transformOrigin: "37% 0%", duration: .22, yoyo: true, repeat: 9, ease: "sine.inOut" }, 3.0)
      .to(bubble, { scale: 1, duration: .45, ease: "back.out(2)" }, 2.75)
      .add(type(b1, "Hi, I'm Vipul! 👋", .75), 3.0)
      .to(mouthO, { opacity: 1, duration: .09, yoyo: true, repeat: 9, ease: "none" }, 3.0)
      .add(type(b2, "Let's get to know me.", .9), 3.9)
      .to(mouthO, { opacity: 1, duration: .09, yoyo: true, repeat: 11, ease: "none" }, 3.9)
      .to(I("standArmR"), { rotation: 0, duration: .5, ease: "power2.inOut" }, 5.0)
      .to(I("standEyes"), { scaleY: .1, transformOrigin: "50% 50%", duration: .08, yoyo: true, repeat: 1 }, 4.9)
      .to(bubble, { scale: 0, opacity: 0, duration: .35, ease: "back.in(2)" }, 5.5)
      // 4. he turns and walks to the desk
      .to(stand, { scaleX: 0, transformOrigin: "50% 100%", duration: .18, ease: "power2.in" }, 5.8)
      .set(walker, { opacity: 1 }, 5.98)
      .to(walker, { scaleX: -1, duration: .18, ease: "power2.out" }, 5.98)
      .to(walker, { x: 318, duration: 1.0, ease: "power1.inOut" }, 6.15)
      .fromTo(legs[0], { rotation: -24 }, { rotation: 24, duration: .2, yoyo: true, repeat: 4, ease: "sine.inOut" }, 6.15)
      .fromTo(legs[1], { rotation: 24 }, { rotation: -24, duration: .2, yoyo: true, repeat: 4, ease: "sine.inOut" }, 6.15)
      .fromTo(arms[0], { rotation: 18 }, { rotation: -18, duration: .2, yoyo: true, repeat: 4, ease: "sine.inOut" }, 6.15)
      .fromTo(arms[1], { rotation: -18 }, { rotation: 18, duration: .2, yoyo: true, repeat: 4, ease: "sine.inOut" }, 6.15)
      .to(walker, { y: 460, duration: .125, yoyo: true, repeat: 7, ease: "sine.inOut" }, 6.15)
      .to(legs.concat(arms), { rotation: 0, duration: .15 }, 7.17)
      // 5. he sits down
      .to(walker, { y: 500, opacity: 0, duration: .35, ease: "power2.in" }, 7.3)
      .fromTo(man, { opacity: 0, y: -26 }, { opacity: 1, y: 0, duration: .4, ease: "power2.out" }, 7.35)
      .to(I("chair"), { y: 6, duration: .14, yoyo: true, repeat: 1, ease: "sine.inOut" }, 7.55)
      // 6. the camera moves in and he opens the laptop
      .to(svg, { scale: 1.4, transformOrigin: "45% 56%", duration: 2.2, ease: "power2.inOut" }, 7.5)
      .to(I("foreNear"), { rotation: -22, svgOrigin: "396 430", duration: .35 }, 7.9)
      .to(I("lapLid"), { rotation: 106, svgOrigin: "594 456", duration: .9, ease: "power2.inOut" }, 8.1)
      .to(I("foreNear"), { rotation: 0, svgOrigin: "396 430", duration: .35 }, 8.8)
      .to(I("lapScreen"), { fill: "#E8FBFF", duration: .1 }, 8.85)
      .to(I("lapScreen"), { fill: "#4CC9F0", duration: .3 }, 8.95)
      .to(I("lapGlow"), { opacity: 1, duration: .5 }, 8.85)
      .to(I("screen"), { fill: "#E8ECF7", duration: .08 }, 9.1)
      .to(I("screen"), { fill: "#0D1530", duration: .3 }, 9.18)
      .to(I("screenUI"), { opacity: 1, duration: .3 }, 9.25)
      // 7. the portfolio opens out of the laptop screen
      .add(function () { reveal(false); }, 9.8);

    $(".intro__skip", ov).addEventListener("click", function () { tl.pause(); reveal(true); });
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { document.removeEventListener("keydown", esc); tl.pause(); reveal(true); } });
  }

  if (animate) {
    gsap.set(heroChars, { yPercent: 115, rotate: 8 });
    gsap.set("[data-hero]", { opacity: 0, y: 24 });
    if (playIntro) storyIntro(heroText); else heroFull();
  }
  var replay = $("#replay");
  if (replay) replay.addEventListener("click", function () { try { sessionStorage.removeItem("vd-intro-seen"); } catch (e) {} window.scrollTo(0, 0); location.reload(); });

  /* =====================================================
     SECTION TITLES: words rise in
     ===================================================== */
  $$(".title .split, .contact__title .split").forEach(function (t) {
    var w = splitWords(t);
    if (!animate) return;
    gsap.from(w, { yPercent: 110, duration: 1, stagger: .08, ease: "expo.out", scrollTrigger: { trigger: t, start: "top 85%" } });
  });

  /* =====================================================
     ABOUT: bento tiles, counters, pointer light
     ===================================================== */
  $$(".tile").forEach(function (t) {
    t.addEventListener("pointermove", function (e) { var r = t.getBoundingClientRect(); t.style.setProperty("--mx", e.clientX - r.left + "px"); t.style.setProperty("--my", e.clientY - r.top + "px"); });
  });
  if (animate) {
    gsap.from(".tile", { y: 60, opacity: 0, scale: .96, duration: .9, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: ".bento", start: "top 80%" } });
    $$(".count").forEach(function (c) {
      var to = parseFloat(c.dataset.to), dec = +(c.dataset.dec || 0), o = { v: 0 };
      c.textContent = (0).toFixed(dec);
      gsap.to(o, { v: to, duration: 2, ease: "power2.out", scrollTrigger: { trigger: c, start: "top 95%" }, onUpdate: function () { c.textContent = o.v.toFixed(dec); } });
    });
    gsap.from(".tile--gold .medal", { rotationY: 360, scale: 0, duration: 1.4, ease: "back.out(1.6)", scrollTrigger: { trigger: ".tile--gold", start: "top 80%" } });
  }

  /* =====================================================
     EXPERIENCE: the rail fills as you scroll
     ===================================================== */
  if (animate) {
    gsap.to(".timeline__fill", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true } });
    $$(".tl-item").forEach(function (it) {
      var fromX = it.classList.contains("tl-item--left") && desktop.matches ? -80 : (desktop.matches ? 80 : 30);
      gsap.timeline({ scrollTrigger: { trigger: it, start: "top 78%" } })
        .from($(".tl-dot", it), { scale: 0, duration: .5, ease: "back.out(3)" })
        .from($(".tl-card", it), { x: fromX, opacity: 0, duration: .9, ease: "power3.out" }, "-=.3")
        .from($$(".tl-card li", it), { opacity: 0, y: 12, stagger: .06, duration: .4 }, "-=.5");
    });
  }

  /* =====================================================
     EDUCATION: cards stack up, rings fill to the score
     ===================================================== */
  var ecards = $$(".ecard");
  function sceneLoop(svg) {
    var tl = gsap.timeline({ repeat: -1, paused: true });
    function q(sel) { return svg.querySelectorAll(sel); }
    gsap.to(q(".tw circle"), { opacity: .2, duration: 1.2, yoyo: true, repeat: -1, stagger: { each: .4, repeat: -1, yoyo: true } });
    gsap.to(q(".win rect"), { opacity: .45, duration: .9, yoyo: true, repeat: -1, stagger: { each: .5, from: "random", repeat: -1, yoyo: true }, ease: "sine.inOut" });
    if (svg.classList.contains("escene--school")) {
      gsap.to(q(".flag"), { scaleX: .82, skewY: 6, transformOrigin: "0% 50%", duration: .5, yoyo: true, repeat: -1, ease: "sine.inOut" });
      tl.to(q(".bell"), { rotation: 22, svgOrigin: "160 43", duration: .18, yoyo: true, repeat: 7, ease: "sine.inOut" }).to({}, { duration: 1.6 });
      gsap.to(q(".tree"), { rotation: 2, svgOrigin: "267 182", duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    } else if (svg.classList.contains("escene--hs")) {
      gsap.to(q(".mhand"), { rotation: 360, svgOrigin: "205 56", duration: 4, repeat: -1, ease: "none" });
      gsap.to(q(".hhand"), { rotation: 360, svgOrigin: "205 56", duration: 48, repeat: -1, ease: "none" });
      tl.fromTo(q(".bub circle"), { y: 0, opacity: 1, scale: 1, transformOrigin: "50% 50%" }, { y: -90, opacity: 0, scale: 1.6, duration: 2, stagger: .45, ease: "power1.out" });
      gsap.to(q(".flask"), { rotation: 2, svgOrigin: "84 184", duration: .25, yoyo: true, repeat: -1, repeatDelay: 1.5 });
    } else if (svg.classList.contains("escene--college")) {
      tl.set(q(".conf rect"), { opacity: 0, x: 0, y: 0 })
        .to(q(".cap"), { y: -26, rotation: -12, svgOrigin: "160 50", duration: .55, ease: "power2.out" })
        .to(q(".cap"), { rotation: 348, duration: .7, ease: "none" }, "<")
        .to(q(".conf rect"), { opacity: 1, duration: .1 }, "<.3")
        .to(q(".conf rect"), { x: function (i) { return [-30, 26, -42, 40, 4][i]; }, y: function (i) { return [-24, -30, -6, -10, -36][i]; }, rotation: 180, duration: .8, ease: "power2.out" }, "<")
        .to(q(".cap"), { y: 0, rotation: 360, duration: .5, ease: "bounce.out" })
        .to(q(".conf rect"), { y: "+=60", opacity: 0, duration: .9, ease: "power1.in" }, "<")
        .set(q(".cap"), { rotation: 0 })
        .to({}, { duration: 1.4 });
    } else if (svg.classList.contains("escene--course")) {
      var line = q(".cline")[0], len = line.getTotalLength();
      tl.set(line, { strokeDasharray: len, strokeDashoffset: len })
        .fromTo(q(".cbars rect"), { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: .6, stagger: .1, ease: "power3.out" })
        .to(line, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, "-=.2")
        .fromTo(q(".badge"), { scale: 0, rotation: -30, transformOrigin: "50% 40%" }, { scale: 1, rotation: 0, duration: .5, ease: "back.out(2.5)" })
        .to({}, { duration: 2 })
        .to([q(".cbars rect"), line, q(".badge")], { opacity: 0, duration: .3 })
        .set([q(".cbars rect"), line, q(".badge")], { opacity: 1 });
    }
    return tl;
  }
  ecards.forEach(function (c) {
    if (!animate) return;
    var loop = sceneLoop($(".escene", c));
    ScrollTrigger.create({ trigger: c, start: "top bottom", end: "bottom top", onToggle: function (st) { if (st.isActive) loop.play(); else loop.pause(); } });
    ScrollTrigger.create({ trigger: c, start: "top 80%", once: true, onEnter: function () {
      gsap.from($$(".ecard__body > *, .ecard__score", c), { y: 24, opacity: 0, duration: .7, stagger: .08, ease: "power3.out" });
    } });
  });
  if (animate) {
    ScrollTrigger.matchMedia({
      "(min-width: 901px)": function () {
        ecards.forEach(function (c, i) {
          var next = ecards[i + 1]; if (!next) return;
          gsap.to(c, { scale: .94 - (ecards.length - 2 - i) * 0, opacity: .45, ease: "none",
            scrollTrigger: { trigger: next, start: "top 85%", end: "top " + (96 + (i + 1) * 22) + "px", scrub: true } });
        });
      }
    });
  }

  /* =====================================================
     PROJECT VISUALS: each one runs on a loop while Projects is on screen
     ===================================================== */
  function txt(s, x, y, t, cls, anchor) { var n = el("text", { x: x, y: y, class: cls || "v-text" }, s); if (anchor) n.setAttribute("text-anchor", anchor); n.textContent = t; return n; }

  // NEXUS BI: data flows from the database into a live dashboard
  function vizBI(s) {
    el("ellipse", { cx: 40, cy: 66, rx: 26, ry: 9, fill: "#1A2550", stroke: "#4CC9F0", "stroke-width": 2 }, s);
    el("path", { d: "M14 66 v60 a26 9 0 0 0 52 0 v-60", fill: "#1A2550", stroke: "#4CC9F0", "stroke-width": 2 }, s);
    el("path", { d: "M14 86 a26 9 0 0 0 52 0 M14 106 a26 9 0 0 0 52 0", fill: "none", stroke: "#4CC9F0", "stroke-width": 1.5, opacity: .6 }, s);
    txt(s, 40, 152, "PostgreSQL", "v-text v-text--sm", "middle");
    var pipe = el("path", { d: "M68 96 C90 96 92 96 112 96", class: "v-edge", "stroke-dasharray": "4 5" }, s);
    var flow = [0, 1, 2].map(function () { return el("circle", { r: 4, fill: "#F5A524", cx: 68, cy: 96 }, s); });
    el("rect", { x: 112, y: 14, width: 200, height: 172, rx: 12, class: "v-panel" }, s);
    txt(s, 124, 36, "Revenue", "v-text v-text--sm");
    var kpi = txt(s, 124, 58, "₹4.2M", "v-kpi");
    var donut = el("circle", { cx: 284, cy: 44, r: 16, fill: "none", stroke: "#F5A524", "stroke-width": 7, "stroke-dasharray": "60 101", transform: "rotate(-90 284 44)" }, s);
    el("circle", { cx: 284, cy: 44, r: 16, fill: "none", stroke: "#24305E", "stroke-width": 7, opacity: .5 }, s);
    var bars = [];
    for (var i = 0; i < 6; i++) bars.push(el("rect", { x: 126 + i * 24, y: 120, width: 15, height: 50, rx: 3, class: "v-bar" + (i > 3 ? " v-bar--hi" : "") }, s));
    el("line", { x1: 120, x2: 300, y1: 172, y2: 172, class: "v-grid" }, s);
    var ln = el("path", { class: "v-line" }, s), fc = el("path", { class: "v-dash" }, s);
    function setData() {
      var p = [], h;
      bars.forEach(function (b, k) { h = 30 + Math.random() * 55 + k * 4; gsap.to(b, { attr: { y: 172 - h, height: h }, duration: .8, ease: "power3.out" }); p.push([133 + k * 24, 172 - h - 12]); });
      ln.setAttribute("d", smoothPath(p)); var l = p[p.length - 1];
      fc.setAttribute("d", "M" + l[0] + "," + l[1] + " L" + (l[0] + 26) + "," + (l[1] - 16) + " L" + (l[0] + 40) + "," + (l[1] - 28));
      var len = dash(ln); gsap.to(ln, { strokeDashoffset: 0, duration: 1, delay: .3, ease: "power2.out" });
      kpi.textContent = "₹" + (3.8 + Math.random() * 1.6).toFixed(1) + "M";
      gsap.fromTo(kpi, { opacity: .2 }, { opacity: 1, duration: .5 });
      gsap.to(donut, { attr: { "stroke-dasharray": (40 + Math.random() * 50).toFixed(0) + " 101" }, duration: .9, ease: "power2.out" });
    }
    var pl = pipe.getTotalLength();
    var tl = gsap.timeline({ repeat: -1, paused: true });
    flow.forEach(function (d, k) {
      var o = { v: 0 };
      tl.to(o, { v: 1, duration: .9, ease: "none", onUpdate: function () { var pt = pipe.getPointAtLength(o.v * pl); d.setAttribute("cx", pt.x); d.setAttribute("cy", pt.y); } }, k * .3);
    });
    tl.add(setData, .9).to({}, { duration: 1.6 });
    return tl;
  }

  // AI Executive Agent: requests flow through the agent, and a chat plays out
  function vizAgent(s) {
    function box(x, y, label, icon) { el("rect", { class: "v-node", x: x - 44, y: y - 15, width: 88, height: 30, rx: 9 }, s); txt(s, x, y + 4, label, "v-text", "middle"); }
    var ed = ["M60,30 C110,30 110,62 160,62", "M60,94 C110,94 110,62 160,62", "M160,62 C210,62 210,30 260,30", "M160,62 C210,62 210,94 260,94"].map(function (d) { return el("path", { class: "v-edge", d: d }, s); });
    box(58, 30, "Gmail"); box(58, 94, "Calendar"); box(262, 30, "OpenRouter"); box(262, 94, "Actions");
    var core = el("circle", { class: "v-node v-node--core", cx: 160, cy: 62, r: 25 }, s);
    var halo = el("circle", { cx: 160, cy: 62, r: 25, fill: "none", stroke: "#F5A524", "stroke-width": 2, opacity: 0 }, s);
    txt(s, 160, 66, "Agent", "v-text v-text--dark", "middle");
    var pu = ed.map(function () { return el("circle", { class: "v-pulse", r: 4.5, cx: 160, cy: 62, opacity: 0 }, s); });
    var ub = el("rect", { x: 14, y: 128, width: 210, height: 26, rx: 13, fill: "#24305E", class: "v-ub" }, s);
    var ut = txt(s, 28, 145, "", "v-text");
    var ab = el("rect", { x: 96, y: 162, width: 210, height: 26, rx: 13, fill: "#F5A524", class: "v-ab" }, s);
    var at = txt(s, 110, 179, "", "v-text v-text--dark");
    function typeTo(node, text, dur) { var o = { n: 0 }; return gsap.to(o, { n: text.length, duration: dur, ease: "none", onUpdate: function () { node.textContent = text.slice(0, Math.round(o.n)); } }); }
    var chats = [["Move my 3 pm meeting to Friday", "Done. Your calendar is updated."], ["Summarise today's unread emails", "You have 4 emails. 2 need replies."]];
    var tl = gsap.timeline({ repeat: -1, paused: true });
    chats.forEach(function (c) {
      tl.add(function () { ut.textContent = ""; at.textContent = ""; })
        .set([ub, ut, ab, at], { opacity: 0 })
        .to([ub, ut], { opacity: 1, duration: .25 })
        .add(typeTo(ut, c[0], .9));
      [[0, 2], [3]].forEach(function (pair) {
        pair.forEach(function (ei) {
          var p = ed[ei], len = p.getTotalLength(), o = { v: 0 };
          tl.to(o, { v: 1, duration: .55, ease: "power1.inOut", onStart: function () { pu[ei].setAttribute("opacity", 1); }, onUpdate: function () { var pt = p.getPointAtLength(o.v * len); pu[ei].setAttribute("cx", pt.x); pu[ei].setAttribute("cy", pt.y); }, onComplete: function () { pu[ei].setAttribute("opacity", 0); } });
        });
        tl.fromTo(halo, { attr: { r: 25 }, opacity: .9 }, { attr: { r: 40 }, opacity: 0, duration: .5 }, "<");
      });
      tl.to([ab, at], { opacity: 1, duration: .25 }).add(typeTo(at, c[1], .8)).to({}, { duration: 1.6 });
    });
    return tl;
  }

  // Course recommender: courses get scored and re-ranked for each learner
  function vizRec(s) {
    var av = el("g", {}, s);
    el("circle", { cx: 46, cy: 98, r: 30, fill: "#1A2550", stroke: "#4CC9F0", "stroke-width": 2 }, av);
    el("circle", { cx: 46, cy: 90, r: 9, fill: "#C98B62" }, av);
    el("path", { d: "M30 116 q16 -18 32 0", fill: "#4CC9F0" }, av);
    var who = txt(s, 46, 148, "Learner A", "v-text v-text--sm", "middle");
    var names = ["Python for Data", "SQL Essentials", "Deep Learning", "Power BI", "Statistics"];
    var rows = names.map(function (n, i) {
      var g = el("g", {}, s);
      var r = el("rect", { x: 108, y: 0, width: 200, height: 28, rx: 8, class: "v-row" }, g);
      txt(g, 118, 18, n, "v-text v-text--sm");
      el("rect", { x: 222, y: 11, width: 60, height: 6, rx: 3, fill: "#24305E", class: "v-track" }, g);
      var bar = el("rect", { x: 222, y: 11, width: 30, height: 6, rx: 3, fill: "#4CC9F0" }, g);
      var rank = el("circle", { cx: 296, cy: 14, r: 8, fill: "#F5A524", opacity: 0, class: "v-rank" }, g);
      var rt = txt(g, 296, 18, "", "v-text v-text--dark v-text--sm", "middle");
      gsap.set(g, { y: 18 + i * 34 });
      return { g: g, r: r, bar: bar, rank: rank, rt: rt, score: .5 };
    });
    var links = [0, 1, 2].map(function () { return el("path", { class: "v-link", d: "" }, s); });
    var learners = ["Learner A", "Learner B", "Learner C"], li = 0;
    function rerank() {
      who.textContent = learners[li++ % learners.length];
      rows.forEach(function (r) { r.score = .2 + Math.random() * .8; });
      var order = rows.slice().sort(function (a, b) { return b.score - a.score; });
      order.forEach(function (r, i) {
        gsap.to(r.g, { y: 18 + i * 34, duration: .8, ease: "power3.inOut" });
        gsap.to(r.bar, { attr: { width: 60 * r.score }, duration: .8 });
        r.r.classList.toggle("is-top", i < 3);
        gsap.to(r.rank, { opacity: i < 3 ? 1 : 0, duration: .3 }); r.rt.textContent = i < 3 ? i + 1 : "";
        if (i < 3) { var y = 18 + i * 34 + 14; links[i].setAttribute("d", "M76 98 C92 98 92 " + y + " 108 " + y); var len = dash(links[i]); gsap.to(links[i], { strokeDashoffset: 0, duration: .6, delay: .8 }); }
      });
    }
    return gsap.timeline({ repeat: -1, paused: true }).add(rerank).to({}, { duration: 2.6 });
  }

  // Apple stock: candles stream past while the LSTM line forecasts ahead
  function vizStock(s) {
    var N = 20, step = 12, W = N * step, noise = [];
    var r = rng(21); for (var i = 0; i < N; i++) noise.push((r() - .5) * 10);
    function close(i) { var k = ((i % N) + N) % N; return 104 - 22 * Math.sin(2 * Math.PI * k / N) - 9 * Math.sin(6 * Math.PI * k / N) + noise[k]; }
    var clip = el("clipPath", { id: "stockClip" }, el("defs", {}, s)); el("rect", { x: 10, y: 20, width: 236, height: 160 }, clip);
    for (var g = 0; g < 4; g++) el("line", { class: "v-grid", x1: 10, x2: 310, y1: 40 + g * 40, y2: 40 + g * 40 }, s);
    var wrap = el("g", { "clip-path": "url(#stockClip)" }, s), strip = el("g", {}, wrap), lp = [];
    for (var c = 0; c < N * 2 + 2; c++) {
      var o = close(c - 1), cl = close(c), x = 16 + c * step, up = cl < o, hi = Math.min(o, cl) - 6 - noise[c % N] * .4, lo = Math.max(o, cl) + 6;
      el("line", { x1: x, x2: x, y1: hi, y2: lo, stroke: up ? "#4ADE80" : "#FF6B6B", "stroke-width": 1.5 }, strip);
      el("rect", { x: x - 4, y: Math.min(o, cl), width: 8, height: Math.max(2, Math.abs(cl - o)), rx: 1, fill: up ? "#4ADE80" : "#FF6B6B" }, strip);
      lp.push([x, cl + 2]);
    }
    el("path", { class: "v-line v-line--c", d: smoothPath(lp), opacity: .9 }, strip);
    el("line", { x1: 246, x2: 246, y1: 22, y2: 180, stroke: "#9AA6C7", "stroke-dasharray": "3 4" }, s);
    var fc = el("path", { class: "v-dash", d: "M246 96 C262 90 276 80 300 70" }, s);
    var dot = el("circle", { cx: 300, cy: 70, r: 5, fill: "#F5A524" }, s);
    txt(s, 252, 34, "LSTM", "v-text v-text--sm");
    txt(s, 14, 16, "AAPL", "v-text");
    var px = txt(s, 56, 16, "$228.40", "v-text v-text--up");
    var tl = gsap.timeline({ repeat: -1, paused: true });
    tl.extra = gsap.to(strip, { x: -W, duration: 14, ease: "none", repeat: -1, paused: true });
    tl
      .add(function () { var v = 220 + Math.random() * 16, up = Math.random() > .4; px.textContent = "$" + v.toFixed(2); px.setAttribute("class", "v-text " + (up ? "v-text--up" : "v-text--down")); }, .6)
      .fromTo(dot, { attr: { r: 5 } }, { attr: { r: 8 }, duration: .3, yoyo: true, repeat: 1 }, .2)
      .to({}, { duration: 1.2 });
    return tl;
  }

  // Global development: countries scatter, then settle into 3 clusters
  function vizCluster(s) {
    var colors = ["#4CC9F0", "#F5A524", "#A78BFA"], dots = [];
    for (var g = 0; g < 4; g++) el("line", { class: "v-grid", x1: 10, x2: 310, y1: 30 + g * 45, y2: 30 + g * 45 }, s);
    for (var i = 0; i < 36; i++) dots.push(el("circle", { r: 5, cx: 160, cy: 100, fill: "#4A5890" }, s));
    var cents = colors.map(function (c) { return el("path", { d: "M-7 -7 L7 7 M7 -7 L-7 7", stroke: c, "stroke-width": 3.5, "stroke-linecap": "round", opacity: 0 }, s); });
    var label = txt(s, 14, 192, "k-means, k = 3", "v-text v-text--sm");
    function run() {
      var cs = [[60 + Math.random() * 50, 50 + Math.random() * 40], [170 + Math.random() * 40, 40 + Math.random() * 40], [110 + Math.random() * 120, 130 + Math.random() * 30]];
      var tl = gsap.timeline();
      tl.to(dots, { attr: { cx: function () { return 20 + Math.random() * 280; }, cy: function () { return 20 + Math.random() * 160; } }, fill: "#4A5890", duration: .9, ease: "power2.inOut", stagger: .008 })
        .to(cents, { opacity: 0, duration: .2 }, 0)
        .add(function () { cents.forEach(function (c, k) { c.setAttribute("transform", "translate(" + cs[k][0] + " " + cs[k][1] + ")"); }); })
        .to(cents, { opacity: 1, duration: .3, stagger: .1 }, "+=.3")
        .to(dots, { attr: { cx: function (k) { var c = cs[k % 3]; return c[0] + (Math.random() - .5) * 52; }, cy: function (k) { var c = cs[k % 3]; return c[1] + (Math.random() - .5) * 40; } }, fill: function (k) { return colors[k % 3]; }, duration: 1.2, ease: "expo.inOut", stagger: .01 });
      return tl;
    }
    return gsap.timeline({ repeat: -1, paused: true }).add(run).to({}, { duration: 4.6 });
  }

  var builders = { "viz--bi": vizBI, "viz--agent": vizAgent, "viz--rec": vizRec, "viz--stock": vizStock, "viz--cluster": vizCluster };
  var loops = $$(".viz").map(function (s) {
    var key = Object.keys(builders).filter(function (k) { return s.classList.contains(k); })[0];
    if (!window.gsap) return null;
    var l = builders[key](s);
    return animate ? l : null;
  });
  // every project animation starts when Projects first appears, then keeps running
  var loopsStarted = false;
  function updateLoops() {}
  function startLoops() {
    if (loopsStarted) return; loopsStarted = true;
    loops.forEach(function (l) { if (!l) return; l.play(); if (l.extra) l.extra.play(); });
  }
  if (animate) startLoops(); // start right away; nothing depends on scrolling

  /* =====================================================
     PROJECTS: horizontal scroll (desktop), swipe (mobile), arrow buttons
     ===================================================== */
  var track = $("#pTrack"), pcards = $$(".pcard", track), pCur = $("#pCur"), pPrev = $("#pPrev"), pNext = $("#pNext");
  var projST = null, pIndex = 0;
  function setIndex(i) {
    pIndex = Math.max(0, Math.min(pcards.length - 1, i));
    pCur.textContent = pIndex + 1;
    pPrev.disabled = pIndex === 0; pNext.disabled = pIndex === pcards.length - 1;
    if (animate) updateLoops();
  }
  setIndex(0);
  function goTo(i) {
    i = Math.max(0, Math.min(pcards.length - 1, i));
    if (projST) { // desktop: the pinned section maps page scroll to the cards
      var y = projST.start + (projST.end - projST.start) * i / (pcards.length - 1) + 1;
      if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      var c = pcards[i];
      track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
    setIndex(i);
  }
  pPrev.addEventListener("click", function () { goTo(pIndex - 1); });
  pNext.addEventListener("click", function () { goTo(pIndex + 1); });
  track.addEventListener("scroll", function () {
    if (projST) return;
    var mid = track.scrollLeft + track.clientWidth / 2, best = 0;
    pcards.forEach(function (c, i) { if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(pcards[best].offsetLeft + pcards[best].offsetWidth / 2 - mid)) best = i; });
    setIndex(best);
  }, { passive: true });

  if (animate) {
    ScrollTrigger.matchMedia({
      "(min-width: 901px)": function () {
        function dist() { return track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft); }
        var tw = gsap.to(track, {
          x: function () { return -dist(); }, ease: "none",
          scrollTrigger: {
            trigger: ".projects__pin", start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: function (st) { setIndex(Math.round(st.progress * (pcards.length - 1))); }
          }
        });
        projST = tw.scrollTrigger;
        return function () { projST = null; gsap.set(track, { x: 0 }); };
      }
    });
  }

  /* =====================================================
     SKILLS: marquee that reacts to scroll speed
     ===================================================== */
  $$(".marquee__row").forEach(function (row, i) {
    row.innerHTML += row.innerHTML; // duplicate for a seamless loop
    if (!animate) return;
    var rev = row.classList.contains("marquee__row--rev");
    var tw = gsap.fromTo(row, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, duration: 38 + i * 6, ease: "none", repeat: -1 });
    ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate: function (st) { var v = Math.min(5, 1 + Math.abs(st.getVelocity()) / 400); gsap.to(tw, { timeScale: v, duration: .2, overwrite: true }); gsap.to(tw, { timeScale: 1, duration: 1, delay: .2 }); } });
  });
  if (animate) gsap.from(".skill", { y: 50, opacity: 0, duration: .8, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: ".skills__grid", start: "top 82%" } });

  /* =====================================================
     RESEARCH: 3D tilt card, stamp, certificates
     ===================================================== */
  if (animate) {
    var paper = $(".paper");
    if (finePointer) {
      var tx = gsap.quickTo(paper, "rotationY", { duration: .6, ease: "power3" }), ty = gsap.quickTo(paper, "rotationX", { duration: .6, ease: "power3" });
      gsap.set(paper, { transformPerspective: 900 });
      paper.addEventListener("pointermove", function (e) { var r = paper.getBoundingClientRect(); tx(((e.clientX - r.left) / r.width - .5) * 10); ty(-((e.clientY - r.top) / r.height - .5) * 10); });
      paper.addEventListener("pointerleave", function () { tx(0); ty(0); });
    }
    gsap.timeline({ scrollTrigger: { trigger: ".research__grid", start: "top 78%" } })
      .from(".paper", { y: 70, opacity: 0, duration: 1, ease: "power3.out" })
      .from(".paper__stamp", { scale: 2.4, opacity: 0, rotate: -40, duration: .5, ease: "power4.in" }, "-=.3")
      .from(".cert", { x: 50, opacity: 0, duration: .6, stagger: .08, ease: "power3.out" }, .2)
      .from(".cert--gold .medal", { rotationY: 360, scale: 0, duration: 1.2, ease: "back.out(1.6)" }, .4);
  }

  /* =====================================================
     CONTACT: he closes the laptop, grabs his bag and says "Hire me!"
     ===================================================== */
  (function contactScene() {
    var svg = contactSvg, stage = $("#cStage");
    svg.setAttribute("viewBox", "200 40 860 720");
    $("#cScene").appendChild(svg);
    function C(id) { return stage.querySelector("#c-" + id); }
    // a second layer holding only him (and his speech bubble), so icons can pass behind him
    var front = document.createElementNS(NS, "svg");
    front.setAttribute("viewBox", "200 40 860 720"); front.setAttribute("class", "contact__front"); front.setAttribute("aria-hidden", "true");
    front.appendChild(svg.querySelector("#c-stand")); front.appendChild(svg.querySelector("#c-bubble"));
    stage.insertBefore(front, $(".orb", stage));
    C("walker").classList.add("hide");
    var stand = C("stand"), bubble = C("bubble"), man = C("man");
    var orbs = $$(".orb", stage);
    var st = { angle: -0.6, speed: 1, spread: 0 };
    var ready = !animate; // icons can't be opened until they have flown out around him

    function place() {
      var W = stage.offsetWidth, H = stage.offsetHeight, cx = W * .488, cy = H * .56, rx = W * .41, ry = H * .3;
      orbs.forEach(function (o, i) {
        var a = st.angle + i * Math.PI / 2, depth = (Math.sin(a) + 1) / 2;
        var x = cx + Math.cos(a) * rx * st.spread, y = cy + Math.sin(a) * ry * st.spread;
        var sc = (.82 + .28 * depth) * (.2 + .8 * Math.min(1, st.spread));
        o.style.left = "0px"; o.style.top = "0px";
        o.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + sc.toFixed(3) + ")";
        var behind = Math.sin(a) < 0 && st.spread > .5; // top half of the orbit = behind him
        o.classList.toggle("is-behind", behind);
        if (!o.classList.contains("is-open")) o.style.zIndex = behind ? 4 : 6;
      });
    }

    function finalPose() {
      gsap.set(man, { opacity: 0 });
      gsap.set([stand, C("bagBack"), C("bagStraps")], { opacity: 1 });
      gsap.set(C("bagFloor"), { opacity: 0 });
      gsap.set(C("lapLid"), { rotation: 0, svgOrigin: "594 456" });
      gsap.set([C("lapGlow"), C("screenUI")], { opacity: 0 });
      gsap.set(C("screen"), { fill: "#05080F" });
      gsap.set(bubble, { scale: 1 });
      C("b1").textContent = "Hire me! 🙌"; C("b2").textContent = "Here are my contact details.";
    }

    if (!animate) {
      // static version: standing with his bag, icons parked around him
      stand.style.opacity = 1; C("bagBack").setAttribute("opacity", 1); C("bagStraps").setAttribute("opacity", 1);
      man.style.opacity = 0; C("bagFloor").style.opacity = 0;
      C("lapLid").setAttribute("transform", ""); C("lapGlow").style.opacity = 0; C("screenUI").style.opacity = 0;
      C("b1").textContent = "Hire me! 🙌"; C("b2").textContent = "Here are my contact details.";
      st.spread = 1; place(); window.addEventListener("resize", place);
      return;
    }

    // starting pose: still typing at the desk
    gsap.set(stand, { opacity: 0 });
    gsap.set(bubble, { scale: 0, transformOrigin: "0% 100%" });
    place();
    var typing = gsap.to(C("foreNear"), { rotation: -4, svgOrigin: "396 430", duration: .11, yoyo: true, repeat: -1, ease: "sine.inOut" });

    function type(node, text, dur) {
      var chars = Array.from(text), o = { n: 0 };
      return gsap.to(o, { n: chars.length, duration: dur, ease: "none", onUpdate: function () { node.textContent = chars.slice(0, Math.round(o.n)).join(""); } });
    }

    var tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
    tl.add(function () { typing.kill(); })
      // close the laptop
      .to(C("foreNear"), { rotation: -22, svgOrigin: "396 430", duration: .3 }, .1)
      .to(C("lapLid"), { rotation: 0, svgOrigin: "594 456", duration: .7, ease: "power2.inOut" }, .3)
      .to(C("lapGlow"), { opacity: 0, duration: .3 }, .5)
      .to(C("screenUI"), { opacity: 0, duration: .25 }, .8)
      .to(C("screen"), { fill: "#05080F", duration: .3 }, .8)
      // stand up and grab the bag
      .to(man, { opacity: 0, y: -30, duration: .35, ease: "power2.in" }, 1.15)
      .to(C("chair"), { x: -24, duration: .6, ease: "power2.out" }, 1.15)
      .fromTo(stand, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .45, ease: "back.out(1.6)" }, 1.3)
      .to(C("bagFloor"), { x: 40, y: -250, scale: .7, opacity: 0, transformOrigin: "50% 50%", duration: .5, ease: "power2.in" }, 1.45)
      .to([C("bagBack"), C("bagStraps")], { opacity: 1, duration: .2 }, 1.85)
      .to(stand, { y: -8, duration: .15, yoyo: true, repeat: 1 }, 1.9)
      // "Hire me!"
      .to(C("standArmR"), { rotation: -145, transformOrigin: "0% 0%", duration: .5, ease: "back.out(1.6)" }, 2.2)
      .fromTo(C("standForeR"), { rotation: 0 }, { rotation: -28, transformOrigin: "37% 0%", duration: .22, yoyo: true, repeat: 7, ease: "sine.inOut" }, 2.6)
      .to(bubble, { scale: 1, duration: .45, ease: "back.out(2)" }, 2.4)
      .add(type(C("b1"), "Hire me! 🙌", .5), 2.65)
      .to(C("mouthO"), { opacity: 1, duration: .09, yoyo: true, repeat: 7, ease: "none" }, 2.65)
      .add(type(C("b2"), "Here are my contact details.", 1), 3.25)
      .to(C("mouthO"), { opacity: 1, duration: .09, yoyo: true, repeat: 11, ease: "none" }, 3.25)
      .to(C("standArmR"), { rotation: 0, duration: .5, ease: "power2.inOut" }, 4.4)
      // the contact icons burst out and start circling him
      .to(st, { spread: 1, duration: 1.1, ease: "back.out(1.4)", onComplete: function () { ready = true; } }, 3.9)
      // small idle life
      .add(function () {
        gsap.to(stand, { y: -4, duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.to(C("standEyes"), { scaleY: .1, transformOrigin: "50% 50%", duration: .08, yoyo: true, repeat: -1, repeatDelay: 3 });
      });

    ScrollTrigger.create({ trigger: stage, start: "top 65%", once: true, onEnter: function () { tl.play(); } });

    // orbit: runs only while the section is on screen
    function tick(t, dt) { st.angle += .00042 * dt * st.speed; place(); }
    ScrollTrigger.create({ trigger: stage, start: "top bottom", end: "bottom top",
      onToggle: function (self) { if (self.isActive) gsap.ticker.add(tick); else gsap.ticker.remove(tick); } });
    window.addEventListener("resize", place);

    // hover / focus / tap: stop the orbit and show that detail
    function open(o) { if (!ready) return; orbs.forEach(function (x) { x.classList.toggle("is-open", x === o); }); gsap.to(st, { speed: 0, duration: .45, overwrite: "auto" }); }
    function close(o) { o.classList.remove("is-open"); if (!$(".orb.is-open", stage)) gsap.to(st, { speed: 1, duration: .8, overwrite: "auto" }); }
    orbs.forEach(function (o) {
      o.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") open(o); });
      o.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") close(o); });
      o.addEventListener("focus", function () { open(o); });
      o.addEventListener("blur", function () { close(o); });
      o.addEventListener("click", function (e) {
        if (!ready) { e.preventDefault(); return; }
        if (!o.classList.contains("is-open")) { e.preventDefault(); open(o); } // first tap on touch shows the detail
      });
    });
    document.addEventListener("pointerdown", function (e) { if (!e.target.closest(".orb")) orbs.forEach(close); });

    contactScene.finalPose = finalPose;
  })();

  window.addEventListener("load", function () { if (animate) ScrollTrigger.refresh(); });
})();
