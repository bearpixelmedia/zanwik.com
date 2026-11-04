/**
 * Zanwik static-mirror polyfill
 * Restores hero canvas, scroll reveals, Services mega-menu, FAQ accordion,
 * and full-page navigation without Next.js client hydration.
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js-motion");

  /* ---------- Full-page navigation (no RSC) ---------- */
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      if (a.hasAttribute("download")) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) !== "/" || href.indexOf("//") === 0) return;
      if (href.charAt(0) === "#") return;
      e.preventDefault();
      window.location.href = href;
    },
    true
  );

  /* ---------- Scroll reveals ---------- */
  function setupReveals() {
    var nodes = document.querySelectorAll(".reveal, .reveal-scale");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach(function (el, idx) {
      var rect = el.getBoundingClientRect();
      // Only first viewport band shows immediately; rest animate on scroll
      if (rect.top < window.innerHeight * 0.72 && rect.bottom > 0) {
        el.style.transitionDelay = Math.min(idx * 40, 280) + "ms";
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });
  }

  /* ---------- Hero particle network canvas ---------- */
  function setupHeroCanvas() {
    var canvases = document.querySelectorAll("canvas.pointer-events-none");
    if (!canvases.length) return;

    canvases.forEach(function (canvas) {
      if (canvas.dataset.zanwikNet === "1") return;
      canvas.dataset.zanwikNet = "1";
      var parent = canvas.parentElement;
      if (parent) parent.classList.add("zanwik-hero-canvas-wrap");

      var ctx = canvas.getContext("2d");
      if (!ctx) return;

      var nodes = [];
      var raf = 0;
      var running = true;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      function resize() {
        var w = parent ? parent.clientWidth : canvas.clientWidth;
        var h = parent ? parent.clientHeight : canvas.clientHeight;
        if (!w || !h) {
          w = canvas.clientWidth || 640;
          h = canvas.clientHeight || 720;
        }
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed(w, h);
      }

      function seed(w, h) {
        // Geometric mesh density closer to Krastor's wireframe network
        var cols = Math.max(6, Math.floor(w / 70));
        var rows = Math.max(7, Math.floor(h / 70));
        nodes = [];
        var i, j, x, y, jitter;
        for (j = 0; j <= rows; j++) {
          for (i = 0; i <= cols; i++) {
            jitter = 18;
            x = (i / cols) * w + (Math.random() - 0.5) * jitter;
            y = (j / rows) * h + (Math.random() - 0.5) * jitter;
            nodes.push({
              x: x,
              y: y,
              ox: x,
              oy: y,
              phase: Math.random() * Math.PI * 2,
              amp: 6 + Math.random() * 10,
              speed: 0.008 + Math.random() * 0.012,
              r: 1.6 + Math.random() * 1.2,
              neighbors: [],
            });
          }
        }
        // link each node to nearest 3–5 neighbors for polygonal mesh
        for (i = 0; i < nodes.length; i++) {
          var dists = [];
          for (j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            var dx = nodes[i].ox - nodes[j].ox;
            var dy = nodes[i].oy - nodes[j].oy;
            dists.push({ j: j, d: dx * dx + dy * dy });
          }
          dists.sort(function (a, b) {
            return a.d - b.d;
          });
          nodes[i].neighbors = dists.slice(0, 4).map(function (d) {
            return d.j;
          });
        }
      }

      function step() {
        if (!running) return;
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);

        var g = ctx.createRadialGradient(
          w * 0.62,
          h * 0.38,
          20,
          w * 0.55,
          h * 0.45,
          Math.max(w, h) * 0.75
        );
        g.addColorStop(0, "rgba(193,120,50,0.16)");
        g.addColorStop(1, "rgba(193,120,50,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        var i, a, b, n, t;
        t = performance.now() * 0.001;

        for (i = 0; i < nodes.length; i++) {
          a = nodes[i];
          a.x = a.ox + Math.sin(t * a.speed * 60 + a.phase) * a.amp;
          a.y = a.oy + Math.cos(t * a.speed * 50 + a.phase * 1.3) * a.amp * 0.85;
        }

        // mesh edges
        ctx.lineWidth = 1.1;
        for (i = 0; i < nodes.length; i++) {
          a = nodes[i];
          for (n = 0; n < a.neighbors.length; n++) {
            if (a.neighbors[n] <= i) continue;
            b = nodes[a.neighbors[n]];
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var alpha = Math.max(0.08, 0.55 - dist / 280);
            ctx.beginPath();
            ctx.strokeStyle = "rgba(217,138,69," + alpha + ")";
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        for (i = 0; i < nodes.length; i++) {
          a = nodes[i];
          ctx.beginPath();
          ctx.fillStyle = "rgba(250,248,243,0.92)";
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = "rgba(193,120,50,0.28)";
          ctx.arc(a.x, a.y, a.r * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        raf = requestAnimationFrame(step);
      }

      resize();
      step();
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          running = false;
          cancelAnimationFrame(raf);
        } else if (!running) {
          running = true;
          step();
        }
      });
    });
  }

  /* ---------- Services mega-menu ---------- */
  function setupServicesMenu() {
    var btn = null;
    document.querySelectorAll("nav button").forEach(function (b) {
      if ((b.textContent || "").indexOf("Services") !== -1) btn = b;
    });
    if (!btn) return;
    var wrap = btn.parentElement;
    if (!wrap) return;
    wrap.style.position = "relative";

    var existing = document.getElementById("zanwik-services-menu");
    if (existing) existing.remove();

    var menu = document.createElement("div");
    menu.id = "zanwik-services-menu";
    menu.innerHTML = [
      '<a class="blueprint-callout" href="/blueprint">',
      "<strong>The Zanwik Blueprint</strong>",
      "<span>Start here: a fixed-fee plan you own, from $1,500</span>",
      "</a>",
      '<div class="col-label start">Start</div>',
      '<div class="col-label build">Build</div>',
      '<div class="col-label stay">Stay / Run</div>',
      '<a class="item" href="/assess" style="grid-column:1">AI Readiness Assessment</a>',
      '<a class="item" href="/diagnostic" style="grid-column:1">Free Diagnostic</a>',
      '<a class="item" href="/services/strategy" style="grid-column:1">Strategy &amp; Roadmap</a>',
      '<a class="item" href="/services/operations" style="grid-column:2;grid-row:3">Automate the Busywork</a>',
      '<a class="item" href="/services/ai-architecture" style="grid-column:2">AI Agents</a>',
      '<a class="item" href="/services/technology" style="grid-column:2">Connect Your Systems</a>',
      '<a class="item" href="/services/enablement" style="grid-column:2">Train Your Team</a>',
      '<a class="item" href="/services/consolidation" style="grid-column:2">Cut Tool Sprawl</a>',
      '<a class="item" href="/services/product-engineering" style="grid-column:2">Product Engineering</a>',
      '<a class="item" href="/services/embedded-partnership" style="grid-column:3;grid-row:3">We Keep It Running</a>',
      '<a class="item" href="/services/command-center" style="grid-column:3">See It All in One Place</a>',
      '<a class="item" href="/services/token-governance" style="grid-column:3">Control AI Costs</a>',
      '<a class="item" href="/services/on-prem" style="grid-column:3">Private AI</a>',
      '<a class="item" href="/services/transactions" style="grid-column:3">Deals &amp; Exit Readiness</a>',
      '<a class="item" href="/services/advisory" style="grid-column:3">AI Advisory</a>',
      '<a class="all-link" href="/services">All services →</a>',
    ].join("");
    wrap.appendChild(menu);

    function close() {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
    function open() {
      menu.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains("open")) close();
      else open();
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- FAQ accordion ---------- */
  function setupFaq() {
    var heading = null;
    document.querySelectorAll("h2").forEach(function (h) {
      if ((h.textContent || "").trim() === "Straight answers.") heading = h;
    });
    if (!heading) return;
    var col = heading.closest("div");
    var grid = col && col.parentElement;
    if (!grid) return;
    var listCol = null;
    Array.prototype.forEach.call(grid.children, function (child) {
      if (child !== col) listCol = child;
    });
    if (!listCol) return;

    var items = listCol.querySelectorAll(":scope > div.border-t");
    items.forEach(function (item, idx) {
      item.classList.add("zanwik-faq-item");
      var h3 = item.querySelector("h3");
      var p = item.querySelector("p");
      if (!h3 || !p) return;
      h3.setAttribute("role", "button");
      h3.setAttribute("tabindex", "0");
      h3.setAttribute("aria-expanded", idx === 0 ? "true" : "false");
      if (idx === 0) item.classList.add("is-open");

      function toggle() {
        var open = item.classList.contains("is-open");
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var oh = other.querySelector("h3");
          if (oh) oh.setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add("is-open");
          h3.setAttribute("aria-expanded", "true");
        }
      }
      h3.addEventListener("click", toggle);
      h3.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  function boot() {
    setupReveals();
    setupHeroCanvas();
    setupServicesMenu();
    setupFaq();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
