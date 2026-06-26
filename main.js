// ---------- Nav scrolled state ----------
(function () {
  const nav = document.getElementById('nav');
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

// ---------- Reveal on intersect ----------
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (reduce) { targets.forEach(t => t.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(t => io.observe(t));
})();

// ---------- Counter animation ----------
(function () {
  const counters = document.querySelectorAll('[data-counter]');
  const animate = el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const dur = 1600;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const v = target * ease(p);
      el.textContent = v.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
    }
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();

// ---------- Hero particle / node network ----------
(function () {
  const c = document.getElementById('particles');
  if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = c.getContext('2d');
  let w, h, dpr, nodes;
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);
    const count = Math.max(24, Math.min(46, Math.floor((w * h) / 38000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.4,
    }));
  };
  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => {
    const rect = c.getBoundingClientRect();
    mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  let running = false, rafId = 0;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    // Nodes
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(43,128,212,0.55)';
      ctx.fill();
    }
    // Links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          const o = (1 - d / 140) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(27,45,94,${o})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
      // Mouse interaction
      const dx = nodes[i].x - mouse.x, dy = nodes[i].y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 160) {
        const o = (1 - d / 160) * 0.6;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(43,128,212,${o})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    rafId = requestAnimationFrame(draw);
  };

  const start = () => { if (!running) { running = true; rafId = requestAnimationFrame(draw); } };
  const stop = () => { running = false; cancelAnimationFrame(rafId); };

  resize();
  window.addEventListener('resize', resize);

  // Only animate while the hero canvas is actually on screen.
  const vis = new IntersectionObserver(entries => {
    entries[0].isIntersecting ? start() : stop();
  }, { threshold: 0.01 });
  vis.observe(c);

  // Also pause when the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });
})();

// ---------- Contact form (front-end demo only) ----------
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get('name') || !data.get('email') || !data.get('message')) {
      form.reportValidity();
      return;
    }
    form.querySelector('#form-success').classList.remove('hidden');
    form.reset();
  });
})();
